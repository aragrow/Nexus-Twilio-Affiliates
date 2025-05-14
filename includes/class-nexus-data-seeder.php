<?php
/**
 * Nexus Data Seeder Class
 * Generates SQL INSERT statements for populating affiliate and client tables.
 * Requires the Faker library (install via Composer: composer require fzaninotto/faker).
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Ensure Faker is loaded (requires Composer autoloader in main plugin file)
if ( ! class_exists('Faker\Factory') ) {
    // You could trigger an admin notice here or log an error
    error_log('Nexus Twilio Affiliates: Faker library not found. Please run "composer install".');
    // Optionally return or die to prevent errors if Faker is essential at runtime
    // return;
}


class Nexus_Data_Seeder {

    /**
     * Generates SQL INSERT statements for dummy affiliates and clients.
     *
     * NOTE: This function GENERATES the SQL, it does NOT execute it.
     * You need to run the output SQL manually (e.g., via phpMyAdmin)
     * or create another method to execute it using $wpdb.
     *
     * IMPORTANT: Assumes sequential auto-increment IDs starting from 1 for
     * both affiliates and clients for relationship mapping within the generated SQL.
     * This will only work correctly on TRUNCATED/EMPTY tables.
     *
     * @param int $num_affiliates Number of affiliates to generate.
     * @param int $num_clients_per_affiliate Number of clients per affiliate.
     * @return string A string containing all SQL INSERT statements. Returns empty string on error.
     */
    public static function generate_sql( $num_affiliates = 50, $num_clients_per_affiliate = 10 ) {
        global $wpdb;

        // Ensure Faker is available before proceeding
        if (!class_exists('Faker\Factory')) {
            return "-- ERROR: Faker library not found. Please run 'composer install' in the plugin directory.\n";
        }

        // Initialize Faker
        $faker = Faker\Factory::create();

        $table_name_affiliates = $wpdb->prefix . 'nexus_affiliates';
		$table_name_clients = $wpdb->prefix . 'nexus_clients';
        // We also need the users table name if linking clients to WP users
        $table_name_users = $wpdb->prefix . 'users';

        $sql_output = "-- Generated Nexus Twilio Affiliates Dummy Data\n";
        $sql_output .= "-- IMPORTANT: Run this on EMPTY nexus_affiliates and nexus_clients tables for correct ID mapping!\n\n";
        $sql_output .= "START TRANSACTION;\n\n";

        $sql_output .= "-- Generating WordPress Users for Affiliates --\n";
        $affiliate_user_ids = [];
        for ( $i = 1; $i <= $num_affiliates; $i++ ) {
            $affiliate_username = $faker->unique()->userName() . $i;
            $affiliate_email = $faker->unique()->safeEmail();
            $password_hash = wp_hash_password('password'); // Simple default password

            // Generate SQL to insert WP user for affiliate
            $sql_output .= $wpdb->prepare(
                "INSERT INTO `$table_name_users` (`user_login`, `user_pass`, `user_nicename`, `user_email`, `user_registered`, `display_name`) VALUES (%s, %s, %s, %s, NOW(), %s);\n",
                $affiliate_username,
                $password_hash,
                $affiliate_username, // nicename
                $affiliate_email,
                $faker->name() // display_name
            );
            // We need to capture the assumed ID for the usermeta SQL below
             $affiliate_user_ids[$i] = "(SELECT LAST_INSERT_ID())"; // Use SQL function to get the inserted ID
        }

        $sql_output .= "\n-- Generating WordPress User Meta for Affiliates (Roles, etc.) --\n";
         $capabilities_serialized = serialize(['nexus_affiliate' => true]); // Role capability
         $user_level = 0; // Typical level for custom roles

        for ($i = 1; $i <= $num_affiliates; $i++) {
            $user_id_sql = $affiliate_user_ids[$i]; // Get the SQL variable for the user ID
            // Capabilities Meta
            $sql_output .= $wpdb->prepare(
                "INSERT INTO `{$wpdb->usermeta}` (`user_id`, `meta_key`, `meta_value`) VALUES ({$user_id_sql}, %s, %s);\n",
                $wpdb->prefix . 'capabilities',
                $capabilities_serialized
            );
             // User Level Meta
            $sql_output .= $wpdb->prepare(
                "INSERT INTO `{$wpdb->usermeta}` (`user_id`, `meta_key`, `meta_value`) VALUES ({$user_id_sql}, %s, %s);\n",
                 $wpdb->prefix . 'user_level',
                 $user_level
             );
        }


        $sql_output .= "\n-- Generating Affiliates --\n";
        for ( $i = 1; $i <= $num_affiliates; $i++ ) {
            $user_id_sql = $affiliate_user_ids[$i]; // Get the SQL variable for the user ID
            $company_name = $faker->company();
            $contact_name = $faker->name();
            $contact_email = $faker->safeEmail();
            $contact_phone = $faker->phoneNumber();
            $site_rate = $faker->randomFloat(4, 0.01, 0.15); // Rate between 0.01 and 0.15
            $status = $faker->randomElement(['active', 'pending', 'inactive']);
            $twiml_sid = 'AP' . $faker->regexify('[a-f0-9]{32}'); // Fake TwiML App SID format

            $sql_output .= $wpdb->prepare(
                "INSERT INTO `$table_name_affiliates` (`wp_user_id`, `company_name`, `contact_name`, `contact_email`, `contact_phone`, `site_rate_per_minute`, `status`, `twilio_twiml_app_sid`, `created_at`, `updated_at`) VALUES ({$user_id_sql}, %s, %s, %s, %s, %f, %s, %s, NOW(), NOW());\n",
                $company_name,
                $contact_name,
                $contact_email,
                $contact_phone,
                $site_rate,
                $status,
                $twiml_sid
            );
        }

        $sql_output .= "\n-- Generating Clients --\n";
        // Keep track of client usernames/emails to ensure uniqueness if creating WP users
        $client_usernames = [];
        $client_emails = [];
        for ( $aff_i = 1; $aff_i <= $num_affiliates; $aff_i++ ) {
             $sql_output .= "-- Clients for Affiliate ID (assumed) $aff_i --\n";
             $affiliate_id_sql = "(SELECT ID FROM `$table_name_affiliates` WHERE wp_user_id = {$affiliate_user_ids[$aff_i]})"; // Get affiliate ID based on WP User ID

            for ( $cli_i = 1; $cli_i <= $num_clients_per_affiliate; $cli_i++ ) {
                $client_name = $faker->name();
                $client_email_base = $faker->safeEmail();
                $client_phone = $faker->phoneNumber();
                $affiliate_rate = $faker->randomFloat(4, 0.05, 0.30); // Rate between 0.05 and 0.30
                $client_status = $faker->randomElement(['active', 'inactive']);
                $wp_user_id_for_client_sql = 'NULL'; // Default to no WP user

                // Randomly decide if this client gets a WP user account (e.g., 30% chance)
                if (rand(1, 100) <= 30) {
                    $client_username = $faker->userName() . $aff_i . $cli_i;
                    // Ensure username and email are unique among clients being created
                    while (in_array($client_username, $client_usernames)) {
                        $client_username = $faker->userName() . $aff_i . $cli_i . rand(100,999);
                    }
                    while (in_array($client_email_base, $client_emails)) {
                        $client_email_base = rand(100,999) . $faker->safeEmail();
                    }
                    $client_usernames[] = $client_username;
                    $client_emails[] = $client_email_base;

                    $client_password_hash = wp_hash_password('password');

                    // Generate SQL for client WP user
                    $sql_output .= $wpdb->prepare(
                       "-- Create WP User for Client: {$client_name}\nINSERT INTO `$table_name_users` (`user_login`,  `user_pass`, `user_nicename`, `user_email`, `user_registered`, `display_name`) VALUES (%s, %s, %s, %s, NOW(), %s);\n",
                       $client_username,
                       $client_password_hash,
                       $client_username,
                       $client_email_base,
                       $client_name
                    );
                    $client_user_id_sql = "(SELECT LAST_INSERT_ID())"; // Get the ID of the user just inserted

                    // Add User Meta for client role
                     $client_capabilities_serialized = serialize(['nexus_client' => true]);
                     $client_user_level = 0;

                     $sql_output .= $wpdb->prepare(
                         "INSERT INTO `{$wpdb->usermeta}` (`user_id`, `meta_key`, `meta_value`) VALUES ({$client_user_id_sql}, %s, %s);\n",
                         $wpdb->prefix . 'capabilities',
                         $client_capabilities_serialized
                     );
                     $sql_output .= $wpdb->prepare(
                         "INSERT INTO `{$wpdb->usermeta}` (`user_id`, `meta_key`, `meta_value`) VALUES ({$client_user_id_sql}, %s, %s);\n",
                         $wpdb->prefix . 'user_level',
                         $client_user_level
                     );

                    $wp_user_id_for_client_sql = $client_user_id_sql; // Use the SQL variable
                }

                $sql_output .= $wpdb->prepare(
                   "INSERT INTO `$table_name_clients` (`affiliate_id`, `wp_user_id`, `account_no`, `client_name`, `client_email`, `client_phone`, `affiliate_rate_per_minute`, `status`, `created_at`, `updated_at`) 
                    VALUES ({$affiliate_id_sql}, 
                    {$wp_user_id_for_client_sql}, %s, %s, %s, %s, %f, %s, NOW(), NOW());\n",
                    $client_phone, 
                    $client_name,
                    $client_email_base, // Use the potentially unique email
                    $client_phone,
                    $affiliate_rate,
                    $client_status
                );
            }
             $sql_output .= "\n"; // Add newline between affiliate client groups
        }

        $sql_output .= "COMMIT;\n";

        return $sql_output;
    }

     /**
      * Example method to directly execute the seeding.
      * WARNING: Modifies the database directly. Use with extreme caution.
      * Best used via WP-CLI or a temporary admin action.
      * Requires the tables to be EMPTY for sequential ID assumption to work.
      *
      * @param int $num_affiliates
      * @param int $num_clients_per_affiliate
      * @return bool|string True on success, error message string on failure.
      */
    public static function execute_seeding( $num_affiliates = 50, $num_clients_per_affiliate = 10 ) {
        global $wpdb;

        // --- Safety Check: Ensure Faker is loaded ---
        if (!class_exists('Faker\Factory')) {
            return 'ERROR: Faker library not found. Please run "composer install".';
        }

        // --- Safety Check: Maybe add a constant or option check before running ---
        // if (!defined('ALLOW_NEXUS_SEEDING') || !ALLOW_NEXUS_SEEDING) {
        //     return 'ERROR: Seeding is not explicitly allowed.';
        // }

        $table_name_affiliates = $wpdb->prefix . 'nexus_affiliates';
        $table_name_clients = $wpdb->prefix . 'nexus_clients';
        


        // --- Safety Check: Check if tables are empty (optional but recommended) ---
        // $affiliate_count = $wpdb->get_var("SELECT COUNT(*) FROM `$table_name_affiliates`");
        // $client_count = $wpdb->get_var("SELECT COUNT(*) FROM `$table_name_clients`");
        // if ($affiliate_count > 0 || $client_count > 0) {
        //     return "ERROR: Tables are not empty. Seeding requires empty tables to guarantee correct ID relationships.";
        // }

        @ini_set('max_execution_time', 300); // Increase max execution time for potentially long script

        $faker = Faker\Factory::create();
        $results = [];

        $wpdb->query('START TRANSACTION;');

        try {

            $wpdb->query("DELETE FROM $table_name_affiliates WHERE 1=1");
            $wpdb->query("DELETE FROM $table_name_clients WHERE 1=1");
            $wpdb->query("DELETE FROM {$wpdb->users} WHERE user_login LIKE 'affiliate_%';");
            $wpdb->query("DELETE FROM {$wpdb->users} WHERE user_login LIKE 'client_%';");

             // Generate Affiliates and their WP Users
            $affiliate_wp_user_ids = [];
            for ($i = 1; $i <= $num_affiliates; $i++) {
                $username = $faker->unique()->userName . $i;
                $email = $faker->unique()->safeEmail;
                $password = wp_generate_password(); // Use wp_generate_password() for better random ones if needed

                // Create WP User
                $user_id = wp_insert_user([
                    'user_login' => 'affiliate_'.$username,
                    'user_pass' => $password,
                    'user_email' => $email,
                    'display_name' => $faker->name(),
                    'role' => 'nexus_affiliate', // Set role directly
                ]);

                if (is_wp_error($user_id)) {
                    throw new Exception("Failed to create WP user for affiliate $i: " . $user_id->get_error_message());
                }
                $affiliate_wp_user_ids[$i] = $user_id; // Store actual inserted ID

                // Create Affiliate Record

                $affiliate_data = [
                    'wp_user_id'           => $user_id,
                    'company_name'         => $faker->company(),
                    'contact_name'         => $faker->name(),
                    'contact_email'        => $faker->safeEmail(),
                    'contact_phone'        => $faker->phoneNumber(),
                    'site_rate_per_minute' => $faker->randomFloat(4, 0.01, 0.15),
                    'status'               => $faker->randomElement(['active', 'pending', 'inactive']),
                    'twilio_twiml_app_sid' => 'AP' . $faker->regexify('[a-f0-9]{32}'),
                    'created_at'           => current_time('mysql', 1), // GMT time
                    // 'updated_at' will be handled by MySQL TIMESTAMP default ON UPDATE
                ];
                $inserted = $wpdb->insert($table_name_affiliates, $affiliate_data);
                if ($inserted === false) {
                    throw new Exception("Failed to insert affiliate record for WP User ID $user_id: " . $wpdb->last_error);
                }
                $results['affiliates'][] = $wpdb->insert_id; // Store actual affiliate ID

            }

            // Generate Clients
            $client_usernames = [];
            $client_emails = [];
            foreach ($results['affiliates'] as $affiliate_db_id) {
                 // Get the corresponding WP User ID for this affiliate_db_id
                 // (though we could have stored it in the loop above if needed again)
                 //$affiliate_wp_user_id = $wpdb->get_var($wpdb->prepare("SELECT wp_user_id FROM $table_name_affiliates WHERE affiliate_id = %d", $affiliate_db_id));

                for ($j = 1; $j <= $num_clients_per_affiliate; $j++) {
                    $account_no = $faker->phoneNumber();
                    $client_data = [
                        'affiliate_id'             => $affiliate_db_id,
                        'wp_user_id'               => null, // Default
                        'account_no'               => $account_no,
                        'client_name'              => $faker->name(),
                        'client_email'             => $faker->safeEmail(),
                        'client_phone'             => $account_no,
                        'affiliate_rate_per_minute'=> $faker->randomFloat(4, 0.05, 0.30),
                        'status'                   => 'active',
                        'created_at'               => current_time('mysql', 1),
                    ];

                    $clients_log_in = false;
                        
                    if($clients_log_in) {
                        // Randomly create WP user for client
                        if (rand(1, 100) <= 30) {
                            $client_username = $faker->userName() . 'c' . $affiliate_db_id . $j;
                            $client_email = $faker->safeEmail();
                            while (in_array($client_username, $client_usernames)) { $client_username = $faker->userName() . 'c' . $affiliate_db_id . $j . rand(100,999); }
                            while (in_array($client_email, $client_emails)) { $client_email = rand(100,999) . $faker->safeEmail(); }

                            $client_data['client_email'] = $client_email; // Update email if unique one generated
    
                            $client_usernames[] = $client_username;
                            $client_emails[] = $client_email;
                            $client_password = wp_generate_password(); // Reset in case we had a previous one    
                            
                            $client_user_id = wp_insert_user([
                                'user_login' => $client_username,
                                'user_pass' => $client_password,
                                'user_email' => $client_email,
                                'display_name' => $client_data['client_name'],
                                'role' => 'nexus_client',
                            ]);
                            
                            if (!is_wp_error($client_user_id)) {
                                $client_data['wp_user_id'] = $client_user_id;
                            } else {
                                error_log("Warning: Failed to create WP user for client {$client_data['client_name']}: " . $client_user_id->get_error_message());
                                // Proceed without linking WP user for this client
                            }
                        }
                    }

                    $client_inserted = $wpdb->insert($table_name_clients, $client_data);
                    if ($client_inserted === false) {
                        throw new Exception("Failed to insert client record for Affiliate ID $affiliate_db_id: " . $wpdb->last_error);
                    }
                    $results['clients'][] = $wpdb->insert_id;
                }
            }

            $wpdb->query('COMMIT;');
            return true;

        } catch (Exception $e) {
            $wpdb->query('ROLLBACK;'); // Rollback on error
            error_log("Nexus Seeding Error: " . $e->getMessage());
            return "ERROR during seeding: " . $e->getMessage();
        }
    }

} // End class Nexus_Data_Seeder