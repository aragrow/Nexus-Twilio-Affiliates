<?php
class Nexus_Data_Seeder
{
    private static function generate_wp_user_sql($username, $email, $display_name, $role_slug = '', $role_label = '', $level = 0)
    {
        global $wpdb;

        $table_users = $wpdb->prefix . 'users';
        $table_usermeta = $wpdb->prefix . 'usermeta';
        $password_hash = wp_hash_password('password');

        $sql = "-- Create WP User: {$username}\n";
        $sql .= $wpdb->prepare(
            "INSERT INTO `$table_users` (`user_login`, `user_pass`, `user_nicename`, `user_email`, `user_registered`, `display_name`) VALUES (%s, %s, %s, %s, NOW(), %s);\n",
            $username,
            $password_hash,
            $username,
            $email,
            $display_name
        );

        // Use SQL function to reference the user_id just created
        $user_id_sql = "(SELECT LAST_INSERT_ID())";

        if (!empty($role_slug)) {
            $serialized_caps = serialize([$role_slug => true]);

            $sql .= $wpdb->prepare(
                "INSERT INTO `$table_usermeta` (`user_id`, `meta_key`, `meta_value`) VALUES ({$user_id_sql}, %s, %s);\n",
                $wpdb->prefix . 'capabilities',
                $serialized_caps
            );
            $sql .= $wpdb->prepare(
                "INSERT INTO `$table_usermeta` (`user_id`, `meta_key`, `meta_value`) VALUES ({$user_id_sql}, %s, %d);\n",
                $wpdb->prefix . 'user_level',
                $level
            );
        }

        return [$sql, $user_id_sql];
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

        $sql_output = "-- Dummy Data for Affiliates and Clients\nSTART TRANSACTION;\n\n";

        $affiliate_user_ids = [];

        $sql_output .= "-- WordPress Users for Affiliates --\n";
        for ($i = 1; $i <= $num_affiliates; $i++) {
            $username = $faker->unique()->userName() . $i;
            $email = $faker->unique()->safeEmail();
            $display_name = $faker->name();

            [$user_sql, $user_id_sql] = self::generate_wp_user_sql($username, $email, $display_name, 'nexus_affiliate', 'Affiliate', 0);
            $sql_output .= $user_sql . "\n";
            $affiliate_user_ids[$i] = $user_id_sql;

            $company = $faker->company();
            $contact = $faker->name();
            $contact_email = $faker->safeEmail();
            $contact_phone = $faker->phoneNumber();
            $rate = $faker->randomFloat(4, 0.01, 0.15);
            $status = $faker->randomElement(['active', 'pending', 'inactive']);
            $twiml_sid = 'AP' . $faker->regexify('[a-f0-9]{32}');

            $sql_output .= $wpdb->prepare(
                "INSERT INTO `$table_affiliates` (`ID`, `company_name`, `contact_name`, `contact_email`, `contact_phone`, `site_rate_per_minute`, `status`, `twilio_twiml_app_sid`, `created_at`, `updated_at`)
                VALUES (%d, %s, %s, %s, %s, %f, %s, %s, NOW(), NOW());\n",
                $user_id_sql,
                $company,
                $contact,
                $contact_email,
                $contact_phone,
                $rate,
                $status,
                $twiml_sid
            );
        }

        $client_user_ids = [];
        $sql_output .= "\n-- Clients for Affiliates --\n";

        foreach ($affiliate_user_ids as $aff_i) {

            for ($cli_i = 1; $cli_i <= $num_clients_per_affiliate; $cli_i++) {
                $client_name = $faker->name();
                $client_email = $faker->unique()->safeEmail();
                $client_phone = $faker->phoneNumber();
                $rate = $faker->randomFloat(4, 0.05, 0.30);
                $status = $faker->randomElement(['active', 'inactive']);
                $client_user_id_sql = 'NULL';

                $username = $faker->unique()->userName() . $aff_i . $cli_i;
                [$client_user_sql, $client_user_id_sql] = self::generate_wp_user_sql($username, $client_email, $client_name, 'nexus_client', 'Client', 0);
                $sql_output .= $client_user_sql . "\n";
                $client_user_ids[$i] = $client_user_id_sql;

                $sql_output .= $wpdb->prepare(
                    "INSERT INTO `$table_clients` (`ID`, `affiliate_id`, `full_name`, `email`, `phone_number`, `rate_per_minute`, `status`, `created_at`, `updated_at`)
                    VALUES (%d, %d, %s, %s, %s, %f, %s, NOW(), NOW());\n",
                    $client_user_id_sql,
                    $aff_i,
                    $client_name,
                    $client_email,
                    $client_phone,
                    $rate,
                    $status
                );
            }
        }

        $sql_output .= "\n-- Entities for Clients --\n";
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

                $sql_output .= $wpdb->prepare(
                    "INSERT INTO `$table_entities` (`client_id`, `entitiy_name`, `entity_type`, `entity_phone`, `rate_per_minute`, `entity_status`, `created_at`, `updated_at`)
                    VALUES (%d, %s, %s, %s, %f, %s, NOW(), NOW());\n",
                    $cli_i,
                    $entity_name,
                    $entity_type,
                    $entity_phone,
                    $rate,
                    $entity_status
                );
            }
        }

        $sql_output .= "\n-- Data for Entities --\n";
        $entity_login = false;
        // Get all phone numbers with associated entity IDs (optional)
        $results = $wpdb->get_results(
            "SELECT phone_number FROM $table_entities",
            OBJECT
        );
        // Loop through them
        if (! empty($results)) {
            foreach ($results as $row) {
                $charge_to_phone = $row->phone_number;
                $charge_date = $faker->datetime();
                $charge_no_minutes = rand(1, 60);
                $charge_dollars = 0;

                $sql_output .= $wpdb->prepare(
                    "INSERT INTO `$table_data` (`charge_to_phone`, `charge_date`, `charge_no_minutes`, `charge_dollars`, `created_at`, `updated_at`)
                    VALUES (%s, %s, %f, %f, NOW(), NOW());\n",
                    $charge_to_phone,
                    $charge_date,
                    $charge_no_minutes,
                    $charge_dollars
                );
            }
        }

        $sql_output .= "COMMIT;\n";
        return $sql_output;
    }
}
