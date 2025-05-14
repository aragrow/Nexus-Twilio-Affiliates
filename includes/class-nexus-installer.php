<?php
/**
 * Nexus Installer Class
 * Handles plugin activation tasks like creating roles and tables.
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Nexus_Installer {

	/**
	 * Activation hook callback.
	 */
	public static function activate() {
		if ( ! current_user_can( 'activate_plugins' ) ) {
			return;
		}
		self::create_roles();
		self::create_tables();
		// Flush rewrite rules after potentially adding CPTs or Taxonomies later
        flush_rewrite_rules();

        // Set a transient flag for admin notice
        set_transient( 'nexus_twilio_activated', true, 5 );
	}

    /**
     * Deactivation hook callback (Optional).
     */
    public static function deactivate() {
        if ( ! current_user_can( 'activate_plugins' ) ) {
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
	private static function create_roles() {
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
             add_role( 'nexus_affiliate', __( 'Nexus Affiliate', 'nexus-twilio-affiliates' ), $affiliate_capabilities );
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
            add_role( 'nexus_client', __( 'Nexus Client', 'nexus-twilio-affiliates' ), $client_capabilities );
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
    private static function remove_roles() {
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
	private static function create_tables() {
		global $wpdb;
		$wpdb->hide_errors(); // Hide errors during dbDelta

		$charset_collate = $wpdb->get_charset_collate();
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

		// --- Affiliates Table ---
		$table_name_affiliates = $wpdb->prefix . 'nexus_affiliates';
		$sql_affiliates = "CREATE TABLE $table_name_affiliates (
			ID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			wp_user_id BIGINT UNSIGNED NOT NULL,       -- Link to wp_users table
			company_name VARCHAR(255) DEFAULT NULL,
			contact_name VARCHAR(255) DEFAULT NULL,
			contact_email VARCHAR(255) DEFAULT NULL,
			contact_phone VARCHAR(50) DEFAULT NULL,
			site_rate_per_minute DECIMAL(10, 4) DEFAULT 0.0000, -- Rate charged TO the affiliate BY the site
			-- twilio_account_sid VARCHAR(100) DEFAULT NULL, -- Consider storing sensitive data elsewhere or encrypted
            -- twilio_auth_token VARCHAR(100) DEFAULT NULL, -- AVOID storing raw tokens here!
            twilio_twiml_app_sid VARCHAR(100) DEFAULT NULL, -- Useful for routing calls via Twilio
            status VARCHAR(20) NOT NULL DEFAULT 'pending', -- e.g., pending, active, inactive, suspended
			created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (ID),
            UNIQUE KEY unique_wp_user_id (wp_user_id), -- Ensure one affiliate per WP user
            KEY status (status)
		) $charset_collate;";
		dbDelta( $sql_affiliates );

		// --- Clients Table ---
		$table_name_clients = $wpdb->prefix . 'nexus_clients';
		$sql_clients = "CREATE TABLE $table_name_clients (
			ID BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            account_no VARCHAR(20) UNIQUE  NULL, -- Optional account number for client
			affiliate_id BIGINT UNSIGNED NOT NULL,     -- Foreign key to nexus_affiliates table
            wp_user_id BIGINT UNSIGNED DEFAULT NULL,   -- Optional link to wp_users if client logs in
			client_name VARCHAR(255) NOT NULL,
			client_email VARCHAR(255) DEFAULT NULL,
			client_phone VARCHAR(50) DEFAULT NULL,     -- Phone number associated with the client
			affiliate_rate_per_minute DECIMAL(10, 4) DEFAULT 0.0000, -- Rate charged TO the client BY the affiliate
			status VARCHAR(20) NOT NULL DEFAULT 'active', -- e.g., active, inactive
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (ID),
			KEY affiliate_id (affiliate_id),
            UNIQUE KEY unique_wp_user_id (wp_user_id), -- Allow NULLs but ensure uniqueness if set
            KEY status (status)
            -- Consider adding: CONSTRAINT fk_client_affiliate FOREIGN KEY (affiliate_id) REFERENCES $table_name_affiliates(affiliate_id) ON DELETE CASCADE
            -- Note: dbDelta doesn't support FK constraints well. Manage relationships in code or add constraints manually post-creation if needed.
		) $charset_collate;";
		dbDelta( $sql_clients );

		// --- Twilio Data Table ---
		$table_name_data = $wpdb->prefix . 'nexus_twilio_data';
		$sql_data = "CREATE TABLE $table_name_data (
            ID INT AUTO_INCREMENT PRIMARY KEY,
            sid VARCHAR(64) NOT NULL,
            date_created DATETIME,
            date_updated DATETIME,
            date_sent DATETIME NOT NULL,
            account_sid VARCHAR(64),
            to_phone VARCHAR(20) NOT NULL,
            from_phone VARCHAR(20) NOT NULL,
            to_name VARCHAR(255),
            body TEXT,
            status VARCHAR(32),
            num_segments INT,
            num_media INT,
            direction VARCHAR(16),
            api_version VARCHAR(16),
            price DECIMAL(10,4),
            price_unit VARCHAR(8),
            error_code VARCHAR(16),
            error_message TEXT,
            uri VARCHAR(255),

            UNIQUE KEY uniq_from_date_sent (from_phone, date_sent),
            UNIQUE KEY uniq_to_date_sent (to_phone, date_sent),
            CONSTRAINT fk_from_client FOREIGN KEY (from_phone) REFERENCES $table_name_clients(account_no) ON DELETE RESTRICT ON UPDATE CASCADE

		) $charset_collate;";
		dbDelta( $sql_data );

        // --- Potential Future Tables ---
        // Call Logs Table
        // Billing Records Table
        // Twilio Credentials (Secure Storage - perhaps using WP options API with encryption or external vault)

		$wpdb->show_errors(); // Show errors again
	}
}
