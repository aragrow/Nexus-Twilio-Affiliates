<?php
if (! defined('ABSPATH')) {
    exit;
}
require_once(ABSPATH . 'wp-load.php');

class Nexus_Data_Seeder
{
    private static function generate_wp_user_sql($username, $email, $display_name, $role_slug = '', $role_label = '', $level = 0)
    {
        global $wpdb;
        $faker = Faker\Factory::create();
        $table_users = $wpdb->prefix . 'users';
        $table_usermeta = $wpdb->prefix . 'usermeta';
        $plainPassword = $faker->password(8, 12);
        $hashedPassword = password_hash($plainPassword, PASSWORD_BCRYPT);


        $sql = "-- Create WP User: {$username}\n";
        $wpdb->query($wpdb->prepare(
            "INSERT INTO `$table_users` (`user_login`, `user_pass`, `user_nicename`, `user_email`, `user_registered`, `display_name`) 
            VALUES (%s, %s, %s, %s, NOW(), %s);\n",
            $username,
            $hashedPassword,
            $username,
            $email,
            $display_name
        ));

        // Use SQL function to reference the user_id just created
        $user_id_sql = $wpdb->insert_id;

        if (!empty($role_slug)) {
            $serialized_caps = serialize([$role_slug => true]);

            $sql .= $wpdb->prepare(
                "INSERT INTO `$table_usermeta` (`user_id`, `meta_key`, `meta_value`) VALUES (%d, %s, %s);\n",
                $user_id_sql,
                $wpdb->prefix . 'capabilities',
                $serialized_caps
            );
            $sql .= $wpdb->prepare(
                "INSERT INTO `$table_usermeta` (`user_id`, `meta_key`, `meta_value`) VALUES (%d, %s, %d);\n",
                $user_id_sql,
                $wpdb->prefix . 'user_level',
                $level
            );
        }

        error_log(".");
        return $user_id_sql;
    }

    public static function generate_sql($num_affiliates = 50, $num_clients_per_affiliate = 10)
    {
        global $wpdb;

        if (!class_exists('Faker\Factory')) {
            return "-- ERROR: Faker library not found. Please run 'composer install'.\n";
        }

        $faker = Faker\Factory::create();
        $table_affiliates = $wpdb->prefix . 'nexus_affiliates';
        $table_clients = $wpdb->prefix . 'nexus_clients';
        $table_entities = $wpdb->prefix . 'nexus_entities';
        $table_data = $wpdb->prefix . 'nexus_twilio_data';
        $table_workflows         = $wpdb->prefix . 'nexus_workflows';
        $table_workflow_entities = $wpdb->prefix . 'nexus_workflows_entities';

        $sql_output = "-- Dummy Data for Affiliates and Clients\nSTART TRANSACTION;\n\n";

        $affiliate_user_ids = [];

        $wpdb->query("START TRANSACTION");
        $wpdb->query("DELETE FROM $table_data  WHERE 1=1");
        $wpdb->query("DELETE FROM $table_entities WHERE 1=1");
        $wpdb->query("DELETE FROM $table_clients  WHERE 1=1");
        $wpdb->query("DELETE FROM $table_affiliates WHERE 1=1");
        $args_for_get_users = ['role' => ['Affiliate', 'Client', 'Entity']];
        $users_with_role = get_users($args_for_get_users);
        foreach ($users_with_role as $user_object) {
            $user_id    = $user_object->ID;
            wp_delete_user($user_id);
        }


        error_log("-- WordPress Users for Affiliates --\n");
        for ($i = 1; $i <= $num_affiliates; $i++) {
            $username = $faker->unique()->userName() . $i;
            $email = $faker->unique()->safeEmail();
            $display_name = $faker->name();

            $user_id_sql = self::generate_wp_user_sql($username, $email, $display_name, 'nexus_affiliate', 'Affiliate', 0);
            $affiliate_user_ids[] = $user_id_sql;

            $company = $faker->company();
            $contact = $faker->name();
            $contact_email = $faker->safeEmail();
            $contact_phone = $faker->phoneNumber();
            $rate = $faker->randomFloat(4, 0.01, 0.15);
            $status = $faker->randomElement(['active', 'pending', 'inactive']);

            $wpdb->query($wpdb->prepare(
                "INSERT INTO `$table_affiliates` (`ID`, `company_name`, `contact_name`, `contact_email`, `contact_phone`, `rate_per_minute`, `status`, `created_at`, `updated_at`)
                VALUES (%d, %s, %s, %s, %s, %f, %s,  NOW(), NOW());\n",
                $user_id_sql,
                $company,
                $contact,
                $contact_email,
                $contact_phone,
                $rate,
                $status
            ));
        }

        $client_user_ids = [];
        error_log("\n-- Clients for Affiliates --\n");

        foreach ($affiliate_user_ids as $aff_i) {

            for ($cli_i = 1; $cli_i <= $num_clients_per_affiliate; $cli_i++) {
                $client_name = $faker->name();
                $client_email = $faker->unique()->safeEmail();
                $client_phone = $faker->phoneNumber();
                $rate = $faker->randomFloat(4, 0.05, 0.30);
                $status = $faker->randomElement(['active', 'inactive']);
                $client_user_id_sql = 'NULL';

                $username = $faker->unique()->userName() . $aff_i . $cli_i;
                $client_user_id_sql = self::generate_wp_user_sql($username, $client_email, $client_name, 'nexus_client', 'Client', 0);
                $client_user_ids[] = $client_user_id_sql;

                $wpdb->query(
                    $wpdb->prepare(
                        "INSERT INTO `$table_clients` (`ID`, `affiliate_id`, `client_name`, `client_email`, `client_phone`, `rate_per_minute`, `status`, `created_at`, `updated_at`)
                    VALUES (%d, %d, %s, %s, %s, %f, %s, NOW(), NOW());\n",
                        $client_user_id_sql,
                        $aff_i,
                        $client_name,
                        $client_email,
                        $client_phone,
                        $rate,
                        $status
                    )
                );
            }
        }

        error_log("-- Entities for Clients --\n");
        $entity_login = false;
        foreach ($client_user_ids as $cli_i) {
            for ($i = 1; $i <= rand(1, 10); $i++) {
                if ($entity_login) {
                    $username = $faker->unique()->userName() . $cli_i;
                    [$client_user_sql, $entity_user_id_sql] = self::generate_wp_user_sql($username, $client_email, $client_name, 'nexus_client', 'Client', 0);
                    $sql_output .= $entity_user_id_sql . "\n";
                } else
                    $entity_user_id_sql = null;

                $entity_name = $faker->name();
                $entity_type = 'individual';
                $entity_phone = $faker->phoneNumber();
                $rate = $faker->randomFloat(4, 0.05, 0.30);
                $entity_status = 'Active';

                $wpdb->query(
                    $wpdb->prepare(
                        "INSERT INTO `$table_entities` (`client_id`, `entity_name`, `entity_type`, `entity_phone`, `rate_per_minute`, `entity_status`, `created_at`, `updated_at`)
                    VALUES (%d, %s, %s, %s, %f, %s, NOW(), NOW());\n",
                        $cli_i,
                        $entity_name,
                        $entity_type,
                        $entity_phone,
                        $rate,
                        $entity_status
                    )
                );
            }
        }

        error_log("-- Data for Entities --\n");
        $entity_login = false;
        // You can also pass DateTime objects directly:
        $startDate = '2025-01-01 00:00:00';
        $endDate   = '2025-05-15 23:59:59';
        $timezone  = 'UTC'; // The desired timezone for the generated DateTime object
        // Get all phone numbers with associated entity IDs (optional)
        $results = $wpdb->get_results(
            "SELECT entity_phone FROM $table_entities",
            OBJECT
        );
        // Loop through them
        if (! empty($results)) {
            foreach ($results as $row) {
                $charge_to_phone = $row->entity_phone;
                $dateTimeObject = $faker->dateTimeBetween($startDate, $endDate, $timezone);
                $charge_date = $dateTimeObject->format('Y-m-d H:i:s'); // Standard MySQL DATETIME format
                $charge_no_minutes = rand(1, 60);
                $charge_dollars = 0;

                $wpdb->query(
                    $wpdb->prepare(
                        "INSERT INTO `$table_data` (`charge_to_phone`, `charge_date`, `charge_no_minutes`, `charge_dollars`, `created_at`)
                    VALUES (%s, %s, %f, %f, NOW());\n",
                        $charge_to_phone,
                        $charge_date,
                        $charge_no_minutes,
                        $charge_dollars
                    )
                );
            }
        }

        error_log("\n-- WorkFlows for Clients --\n");

        // Get all clients
        $clients = $wpdb->get_results("SELECT ID, client_name FROM $table_clients"); // Or all clients regardless of status

        if (empty($clients)) {
            error_log('Nexus Workflow Seeder: No clients found to seed workflows for.');
            return;
        }

        foreach ($clients as $client) {

            // --- 1. Create a Default Workflow for the Client ---
            $workflow_name = esc_html($client->client_name) . ' - Default Workflow';
            $workflow_data = [
                'client_id'       => $client->ID,
                'workflow_name'   => $workflow_name,
                'workflow_status' => 'active', // Or 'draft'
            ];
            $workflow_format = ['%d', '%s', '%s'];

            $inserted_workflow = $wpdb->insert($table_workflows, $workflow_data, $workflow_format);

            if (false === $inserted_workflow) {
                error_log($wpdb->last_error);
                continue; // Skip to the next client
            }

            $new_workflow_id = $wpdb->insert_id;

            $client_entities = $wpdb->get_results(
                $wpdb->prepare("SELECT ID FROM $table_entities WHERE client_id = %d ORDER BY ID ASC", $client->ID)
            );

            if (empty($client_entities)) {
                continue; // Next client
            }

            // --- 3. Add entities to the workflow in order ---
            $workflow_order = 0;
            foreach ($client_entities as $entity) {
                $workflow_order++; // Increment order for each step

                $workflow_entity_data = [
                    'workflow_id'    => $new_workflow_id,
                    'entity_id'      => $entity->ID,
                    'workflow_order' => $workflow_order,
                    'step_status'    => 'active', // Default status for the step in the workflow template
                ];
                $workflow_entity_format = ['%d', '%d', '%d', '%s'];

                $inserted_step = $wpdb->insert($table_workflow_entities, $workflow_entity_data, $workflow_entity_format);

                if (false === $inserted_step) {
                    error_log($wpdb->last_error);
                }
            }
        }
        error_log("Nexus Workflow Seeder: All clients processed.");

        $wpdb->query("COMMIT");
        error_log('Done');
        return $sql_output;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['seed']) && $_GET['seed'] === 'uyr699^4hf')
    add_action('init', 'nexus_twilio_seeder');

function nexus_twilio_seeder()
{
    if (current_user_can('manage_options')) { // Example condition

        header('Content-Type: text/plain');

        $num_affiliates = isset($_POST['num_affiliates']) ? (int)$_POST['num_affiliates'] : 50;
        $num_clients_per_affiliate = isset($_POST['num_clients_per_affiliate']) ? (int)$_POST['num_clients_per_affiliate'] : 10;

        Nexus_Data_Seeder::generate_sql($num_affiliates, $num_clients_per_affiliate);
        exit;
    }
}
