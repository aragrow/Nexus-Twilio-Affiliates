<?php

/**
 * Nexus Installer Class
 * Handles plugin activation tasks like creating roles and tables.
 */

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

class Nexus_Installer
{

    /**
     * Activation hook callback.
     */
    public static function activate()
    {
        if (! current_user_can('activate_plugins')) {
            return;
        }
        self::create_roles();
        self::create_tables();
        // Flush rewrite rules after potentially adding CPTs or Taxonomies later
        flush_rewrite_rules();

        // Set a transient flag for admin notice
        set_transient('nexus_twilio_activated', true, 5);
    }

    /**
     * Deactivation hook callback (Optional).
     */
    public static function deactivate()
    {
        if (! current_user_can('activate_plugins')) {
            return;
        }
        // Optional: Remove roles if needed (generally not recommended unless uninstalling)
        // self::remove_roles();

        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Create custom user roles.
     */
    private static function create_roles()
    {
        // --- Affiliate Role ---
        $affiliate_capabilities = array(
            'read'                         => true, // Basic WordPress access
            // Custom Capabilities
            'manage_nexus_clients'         => true, // Ability to CRUD their own clients
            'view_nexus_affiliate_dashboard' => true, // Access their specific dashboard area
            'set_nexus_client_rates'       => true, // Ability to set rates for their clients
            'view_nexus_affiliate_billing' => true, // View their billing info from the site owner
            // Potentially inherit capabilities from 'subscriber' or add others as needed
            // 'upload_files' => true, // Example if they need to upload things
        );

        // Add the role only if it doesn't exist.
        if (!get_role('nexus_affiliate')) {
            add_role('nexus_affiliate', __('Nexus Affiliate', 'nexus-twilio-affiliates'), $affiliate_capabilities);
        }


        // --- Client Role ---
        // Clients might not need many backend permissions, mainly identifying them.
        $client_capabilities = array(
            'read'                      => true, // Basic WordPress access
            // Custom Capabilities (Examples)
            'view_nexus_client_dashboard' => true, // Access their specific dashboard area (if they log in)
            'view_nexus_client_billing' => true, // View their billing info from the affiliate
        );

        // Add the role only if it doesn't exist.
        if (!get_role('nexus_client')) {
            add_role('nexus_client', __('Nexus Client', 'nexus-twilio-affiliates'), $client_capabilities);
        }

        // Optional: Add some of our custom capabilities to the Administrator role
        $admin_role = get_role('administrator');
        if ($admin_role) {
            $admin_role->add_cap('manage_nexus_clients');
            $admin_role->add_cap('view_nexus_affiliate_dashboard'); // Admins can likely view all dashboards
            $admin_role->add_cap('set_nexus_client_rates');
            $admin_role->add_cap('view_nexus_affiliate_billing');
            $admin_role->add_cap('view_nexus_client_dashboard');
            $admin_role->add_cap('view_nexus_client_billing');
            $admin_role->add_cap('manage_nexus_affiliates'); // Admin should manage affiliates
        }
    }

    /**
     * Remove custom user roles (use with caution, usually for uninstall).
     */
    private static function remove_roles()
    {
        if (get_role('nexus_affiliate')) {
            remove_role('nexus_affiliate');
        }
        if (get_role('nexus_client')) {
            remove_role('nexus_client');
        }
        // Optional: Remove caps from admin role
        $admin_role = get_role('administrator');
        if ($admin_role) {
            // Remove caps... careful if other plugins use same caps
        }
    }

    /**
     * Create custom database tables.
     */
    private static function create_tables()
    {
        global $wpdb;
        $wpdb->hide_errors(); // Hide errors during dbDelta

        $charset_collate = $wpdb->get_charset_collate();
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

        // --- Affiliates Table ---
        $table_name_affiliates = $wpdb->prefix . 'nexus_affiliates';
        $sql_affiliates = "CREATE TABLE $table_name_affiliates (
			ID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			company_name VARCHAR(255) DEFAULT NULL,
			contact_name VARCHAR(255) DEFAULT NULL,
			contact_email VARCHAR(255) DEFAULT NULL,
			contact_phone VARCHAR(50) DEFAULT NULL,
			rate_per_minute DECIMAL(10, 4) DEFAULT 0.0000, -- Rate charged TO the affiliate BY the site
			-- twilio_account_sid VARCHAR(100) DEFAULT NULL, -- Consider storing sensitive data elsewhere or encrypted
            -- twilio_auth_token VARCHAR(100) DEFAULT NULL, -- AVOID storing raw tokens here!
            twilio_twiml_app_sid VARCHAR(100) DEFAULT NULL, -- Useful for routing calls via Twilio
            status VARCHAR(20) NOT NULL DEFAULT 'pending', -- e.g., pending, active, inactive, suspended
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            KEY status (status)
		) $charset_collate;";
        dbDelta($sql_affiliates);

        // --- Clients Table ---
        $table_name_clients = $wpdb->prefix . 'nexus_clients';
        $sql_clients = "CREATE TABLE $table_name_clients (
            ID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,   -- Optional link to wp_users if client logs in
			affiliate_id BIGINT UNSIGNED NOT NULL,     -- Foreign key to nexus_affiliates table
			client_name VARCHAR(255) NOT NULL,
			client_email VARCHAR(255) DEFAULT NULL,
			client_phone VARCHAR(50) DEFAULT NULL,     -- Phone number associated with the client
			rate_per_minute DECIMAL(10, 4) DEFAULT 0.0000, -- Rate charged TO the client BY the affiliate
			status VARCHAR(20) NOT NULL DEFAULT 'active', -- e.g., active, inactive
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			KEY affiliate_id (affiliate_id),
            CONSTRAINT fk_from_clients_affiliates FOREIGN KEY (affiliate_id) REFERENCES $table_name_affiliates(ID) ON DELETE RESTRICT ON UPDATE CASCADE,
            KEY status (status)
            -- Consider adding: CONSTRAINT fk_client_affiliate FOREIGN KEY (affiliate_id) REFERENCES $table_name_affiliates(affiliate_id) ON DELETE CASCADE
            -- Note: dbDelta doesn't support FK constraints well. Manage relationships in code or add constraints manually post-creation if needed.
		) $charset_collate;";
        dbDelta($sql_clients);

        // --- Entities Table ---
        $table_name_entities = $wpdb->prefix . 'nexus_entities';
        $sql_entities = "CREATE TABLE $table_name_entities (
          ID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,   -- Optional link to wp_users if client logs in
          client_id BIGINT UNSIGNED NOT NULL,     -- Foreign key to nexus_client table
          entity_type VARCHAR(20) NOT NULL,
          entity_name VARCHAR(255) NOT NULL,
          entity_phone VARCHAR(50) DEFAULT NULL,     -- Phone number associated with the client
          rate_per_minute DECIMAL(10, 4) DEFAULT 0.0000, -- Rate charged TO the client BY the affiliate
          entity_status VARCHAR(20) NOT NULL DEFAULT 'active', -- e.g., active, inactive
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          KEY client_id (client_id),
          UNIQUE (entity_phone),
          CONSTRAINT fk_from_entities_clients FOREIGN KEY (client_id) REFERENCES $table_name_clients(ID) ON DELETE RESTRICT ON UPDATE CASCADE,
          KEY status (status)
          -- Consider adding: CONSTRAINT fk_client_affiliate FOREIGN KEY (affiliate_id) REFERENCES $table_name_affiliates(affiliate_id) ON DELETE CASCADE
          -- Note: dbDelta doesn't support FK constraints well. Manage relationships in code or add constraints manually post-creation if needed.
      ) $charset_collate;";
        dbDelta($sql_entities);

        // --- Entity Group Relationships Table ---
        $table_name_entity_group_relationships = $wpdb->prefix . 'nexus_entity_group_relationships';
        $sql_entity_group_relationships = "CREATE TABLE $table_name_entity_group_relationships (
        ID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        g_entity_id BIGINT UNSIGNED NOT NULL,    -- Foreign key to nexus_entity_groups table
        entity_id BIGINT UNSIGNED NOT NULL,      -- Foreign key to nexus_entities table
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_group_entity (g_entity_id, entity_id), -- Prevent duplicate relationships
        KEY ge_entity_id (g_entity_id),
        KEY e_entity_id (entity_id),
        CONSTRAINT fk_group_relationship FOREIGN KEY (g_entity_id) REFERENCES $table_name_entity_groups(ID) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_entity_relationship FOREIGN KEY (entity_id) REFERENCES $table_name_entities(ID) ON DELETE CASCADE ON UPDATE CASCADE
        ) $charset_collate;";
        dbDelta($sql_entity_group_relationships);


        // --- Twilio Data Table ---
        $table_name_data = $wpdb->prefix . 'nexus_twilio_data';
        $sql_data = "CREATE TABLE $table_name_data (
            ID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            charge_date DATETIME DEFAULT NULL,                      -- Consider DEFAULT CURRENT_TIMESTAMP if applicable
            charge_to_phone VARCHAR(20) NOT NULL,
            charge_no_minutes DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- Corrected: Using DECIMAL for precision
            charge_dollars DECIMAL(10, 2) NOT NULL DEFAULT 0.00,    -- Corrected: Using DECIMAL for currency
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (ID),
            KEY idx_charge_to_phone (charge_to_phone),              -- Indexing the column used in FK for performance
            CONSTRAINT fk_data_to_entity_phone FOREIGN KEY (charge_to_phone) REFERENCES wp_nexus_entities(entity_phone) ON DELETE RESTRICT ON UPDATE CASCADE
 	    ) $charset_collate;";
        dbDelta($sql_data);

        $table_name_workflows = $wpdb->prefix . 'nexus_workflows'; // Note: 'workflows' (plural) is common
        $sql_workflows = "CREATE TABLE $table_name_workflows (
            ID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            client_id BIGINT UNSIGNED NOT NULL,          -- Link to the client this workflow belongs to
            workflow_name VARCHAR(255) NOT NULL,
            workflow_status VARCHAR(50) NOT NULL DEFAULT 'active', -- e.g., draft, active, inactive, archived
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (ID),
            KEY client_id (client_id),
            KEY workflow_status (workflow_status),
            CONSTRAINT fk_workflow_client FOREIGN KEY (client_id) REFERENCES $table_name_clients(ID) ON DELETE CASCADE ON UPDATE CASCADE
            -- If a client is deleted, their workflows are also deleted. Adjust ON DELETE if needed (e.g., RESTRICT, SET NULL)
        ) $charset_collate;";
        dbDelta($sql_workflows);

        // --- Workflow Entities Table (Junction Table for Workflow Steps) ---
        $table_name_workflow_entities = $wpdb->prefix . 'nexus_workflows_entities';
        $sql_workflow_entities = "CREATE TABLE $table_name_workflow_entities (
            ID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            workflow_id BIGINT UNSIGNED NOT NULL,        -- Foreign key to nexus_workflows table
            entity_id BIGINT UNSIGNED NOT NULL,          -- Foreign key to nexus_entities table
            workflow_order INT UNSIGNED NOT NULL DEFAULT 0, -- Order of this entity within the workflow
            step_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- Status of this specific step in an instance (e.g., pending, active, completed, skipped) - Might be more for workflow *instances*
            -- If you need specific settings for an entity *within* a workflow, add them here:
            -- step_settings TEXT DEFAULT NULL, -- e.g., JSON for custom parameters for this entity in this step
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (ID),
            UNIQUE KEY unique_workflow_entity_order (workflow_id, entity_id, workflow_order), -- Ensures an entity isn't repeated at the same order in the same workflow
                                                                                            -- Or just UNIQUE KEY unique_workflow_order (workflow_id, workflow_order) if entity_id can be repeated
            KEY workflow_id (workflow_id),
            KEY entity_id (entity_id),
            CONSTRAINT fk_wfe_workflow FOREIGN KEY (workflow_id) REFERENCES $table_name_workflows(ID) ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT fk_wfe_entity FOREIGN KEY (entity_id) REFERENCES $table_name_entities(ID) ON DELETE CASCADE ON UPDATE CASCADE
            -- If an entity or workflow is deleted, these linking records are also deleted.
        ) $charset_collate;";
        dbDelta($sql_workflow_entities);

        // --- Potential Future Tables ---
        // Call Logs Table
        // Billing Records Table
        // Twilio Credentials (Secure Storage - perhaps using WP options API with encryption or external vault)

        $wpdb->show_errors(); // Show errors again
    }
}
