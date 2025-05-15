<?php

/**
 * GraphQL Type Registrations for Nexus Twilio Affiliates
 */

// Exit if accessed directly or WPGraphQL isn't active
if (!defined('ABSPATH')) {
    return;
}

class NexusGraphQLTypeRegistrar
{
    public static function init()
    {
        // error_log(__CLASS__ . '::' . __METHOD__); // Debugging line
        add_action('graphql_register_types', [__CLASS__, 'register_custom_types']);
    }

    public static function register_custom_types()
    {
        // error_log(__CLASS__ . '::' . __METHOD__); // Debugging line
        global $wpdb;
        if (!$wpdb) { // Defensive check
            error_log('NexusGraphQLTypeRegistrar: $wpdb is not available.');
            return;
        }

        $table_name_affiliates = $wpdb->prefix . 'nexus_affiliates';
        $table_name_clients    = $wpdb->prefix . 'nexus_clients'; // Corrected: Removed duplicate/incorrect assignment
        // $table_name_data    = $wpdb->prefix . 'nexus_twilio_data'; // If needed for other types

        // --- Register NexusClient Type ---
        register_graphql_object_type('NexusClient', [
            'description' => __('A client associated with a Nexus Affiliate', 'nexus-twilio-affiliates'),
            'fields'      => [
                'iD' => [
                    'type'        => 'ID',
                    'description' => __('The unique ID of the client', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) {
                        return !empty($client_row->ID) ? (int) $client_row->ID : null; // Corrected: Use ID
                    }
                ],
                'affiliateId' => [
                    'type'        => 'Int', // This is the nexus_clients.affiliate_id column
                    'description' => __('The database ID of the affiliate this client belongs to', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) {
                        return !empty($client_row->affiliate_id) ? (int) $client_row->affiliate_id : null;
                    }
                ],
                'wpUserId' => [
                    'type'        => 'Int',
                    'description' => __('WordPress User ID if the client has a WP account', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) {
                        return !empty($client_row->wp_user_id) ? (int) $client_row->wp_user_id : null;
                    }
                ],
                'clientName' => [
                    'type'        => 'String',
                    'description' => __('Name of the client', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) {
                        return !empty($client_row->client_name) ? (string) $client_row->client_name : null;
                    }
                ],
                'clientEmail' => [
                    'type'        => 'String',
                    'description' => __('Email of the client', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) {
                        return !empty($client_row->client_email) ? (string) $client_row->client_email : null;
                    }
                ],
                'clientPhone' => [
                    'type'        => 'String',
                    'description' => __('Phone number of the client', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) {
                        return !empty($client_row->client_phone) ? (string) $client_row->client_phone : null;
                    }
                ],
                'affiliateRatePerMinute' => [
                    'type'        => 'Float',
                    'description' => __('Rate per minute charged to the client by the affiliate', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) {
                        // Use isset for numeric 0.0000 values which are not "empty"
                        return isset($client_row->affiliate_rate_per_minute) ? (float) $client_row->affiliate_rate_per_minute : null;
                    }
                ],
                'status' => [
                    'type'        => 'String',
                    'description' => __('Status of the client', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) {
                        return !empty($client_row->status) ? (string) $client_row->status : null;
                    }
                ],
                'createdAt' => [
                    'type' => 'String',
                    'description' => __('Creation date of the client', 'nexus-twilio-affiliates'),
                    'resolve' => function ($client_row) {
                        return !empty($client_row->created_at) ? (string) $client_row->created_at : null;
                    }
                ],
                'affiliate' => [ // Field to connect client back to its parent Affiliate
                    'type' => 'NexusAffiliate',
                    'description' => __('The affiliate this client belongs to', 'nexus-twilio-affiliates'),
                    'resolve' => function ($client_row, $args, $context, $info) use ($table_name_affiliates, $wpdb) {
                        if (empty($client_row->affiliate_id)) {
                            return null;
                        }
                        // $client_row->affiliate_id is the FK that points to nexus_affiliates.ID
                        $affiliate_data = $wpdb->get_row(
                            $wpdb->prepare("SELECT * FROM $table_name_affiliates WHERE ID = %d", $client_row->affiliate_id) // Corrected: WHERE ID
                        );
                        return $affiliate_data;
                    }
                ]
            ],
        ]);

        // --- Register NexusAffiliate Type ---
        register_graphql_object_type('NexusAffiliate', [
            'description' => __('A Nexus Twilio Affiliate', 'nexus-twilio-affiliates'),
            'fields'      => [
                'iD' => [ // This is nexus_affiliates.ID (PK)
                    'type'        => 'ID',
                    'description' => __('The unique ID of the affiliate', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($affiliate_row) {
                        return !empty($affiliate_row->ID) ? (int) $affiliate_row->ID : null;
                    }
                ],
                'wpUserId' => [
                    'type'        => 'Int',
                    'description' => __('WordPress User ID of the affiliate', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($affiliate_row) {
                        return !empty($affiliate_row->wp_user_id) ? (int) $affiliate_row->wp_user_id : null;
                    }
                ],
                'companyName' => [
                    'type'        => 'String',
                    'description' => __('Company name of the affiliate', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($affiliate_row) {
                        return !empty($affiliate_row->company_name) ? (string) $affiliate_row->company_name : null;
                    }
                ],
                'siteRatePerMinute' => [
                    'type'        => 'Float',
                    'description' => __('Rate per minute charged to the affiliate by the site', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($affiliate_row) {
                        return isset($affiliate_row->site_rate_per_minute) ? (float) $affiliate_row->site_rate_per_minute : null;
                    }
                ],
                'status' => [
                    'type'        => 'String',
                    'description' => __('Status of the affiliate', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($affiliate_row) {
                        return !empty($affiliate_row->status) ? (string) $affiliate_row->status : null;
                    }
                ],
                'createdAt' => [
                    'type' => 'String',
                    'description' => __('Creation date of the affiliate', 'nexus-twilio-affiliates'),
                    'resolve' => function ($affiliate_row) {
                        return !empty($affiliate_row->created_at) ? (string) $affiliate_row->created_at : null;
                    }
                ],
                'contactName' => [ // Added for completeness from your query
                    'type' => 'String',
                    'description' => __('Contact name for the affiliate', 'nexus-twilio-affiliates'),
                    'resolve' => function ($affiliate_row) {
                        return $affiliate_row->contact_name ?? null;
                    }
                ],
                // ... Add other scalar affiliate fields: contact_email, contact_phone, twilio_twiml_app_sid etc.

                // Connection to NexusClient (List of clients for this affiliate)
                'clients' => [
                    'type'        => ['list_of' => 'NexusClient'],
                    'description' => __('Clients associated with this affiliate', 'nexus-twilio-affiliates'),
                    'args' => [
                        'status' => [ // Optional: filter clients by status
                            'type' => 'String',
                            'description' => __('Filter clients by status (e.g., active)', 'nexus-twilio-affiliates'),
                        ],
                        // You can add more args like 'first', 'after' for pagination
                    ],
                    'resolve'     => function ($affiliate_row, $args, $context, $info) use ($table_name_clients, $wpdb) {
                        // $affiliate_row is the current affiliate object from the parent resolver.
                        // It should have an 'ID' property which is the Primary Key of the nexus_affiliates table.
                        if (empty($affiliate_row->ID)) {
                            error_log('NexusAffiliate.clients resolver: Affiliate ID not found in $affiliate_row. Source: ' . print_r($affiliate_row, true));
                            return []; // No affiliate ID, so no clients can be fetched.
                        }

                        $sql = "SELECT * FROM $table_name_clients WHERE affiliate_id = %d";
                        $params = [(int) $affiliate_row->ID]; // Corrected: Use $affiliate_row->ID

                        if (!empty($args['status'])) {
                            $sql .= " AND status = %s";
                            $params[] = sanitize_text_field($args['status']);
                        } else {
                            // Default to active clients if no status arg is provided
                            $sql .= " AND status = %s";
                            $params[] = 'active';
                        }
                        // Add ORDER BY if needed, e.g., ORDER BY client_name ASC

                        $prepared_sql = $wpdb->prepare($sql, ...$params);
                        $client_rows = $wpdb->get_results($prepared_sql);

                        if ($wpdb->last_error) {
                            error_log('WPDB Error in NexusAffiliate.clients resolver: ' . $wpdb->last_error);
                            return [];
                        }

                        return !empty($client_rows) ? $client_rows : [];
                    }
                ],
            ],
        ]);

        // --- Register Root Queries ---
        register_graphql_field('RootQuery', 'nexusAffiliate', [
            'type'        => 'NexusAffiliate',
            'description' => __('Retrieve a single Nexus Affiliate by ID', 'nexus-twilio-affiliates'),
            'args'        => [
                'iD' => [ // Argument to query by the affiliate's database ID
                    'type'        => ['non_null' => 'ID'],
                    'description' => __('The ID of the affiliate to retrieve.', 'nexus-twilio-affiliates'),
                ],
            ],
            'resolve'     => function ($root, $args, $context, $info) use ($table_name_affiliates, $wpdb) {
                $affiliate_id = isset($args['iD']) ? absint($args['iD']) : 0;
                if (empty($affiliate_id)) {
                    return null;
                }
                // Fetches the raw row. Field resolvers on NexusAffiliate type will handle individual fields.
                return $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name_affiliates WHERE ID = %d", $affiliate_id));
            },
        ]);

        register_graphql_field('RootQuery', 'nexusAffiliates', [
            'type'        => ['list_of' => 'NexusAffiliate'],
            'description' => __('Retrieve a list of Nexus Affiliates', 'nexus-twilio-affiliates'),
            'args'        => [
                'first' => ['type' => 'Int', 'defaultValue' => 10],
                'offset' => ['type' => 'Int', 'defaultValue' => 0],
                'status' => ['type' => 'String'],
                'wpUserId' => ['type' => 'Int'] // Allow filtering by wpUserId
            ],
            'resolve'     => function ($root, $args, $context, $info) use ($table_name_affiliates, $wpdb) {
                $sql = "SELECT * FROM $table_name_affiliates";
                $where_clauses = [];
                $params = [];

                if (!empty($args['status'])) {
                    $where_clauses[] = "status = %s";
                    $params[] = sanitize_text_field($args['status']);
                }
                if (!empty($args['wpUserId'])) {
                    $where_clauses[] = "wp_user_id = %d";
                    $params[] = absint($args['wpUserId']);
                }

                if (count($where_clauses) > 0) {
                    $sql .= " WHERE " . implode(" AND ", $where_clauses);
                }

                $sql .= " ORDER BY company_name ASC LIMIT %d OFFSET %d"; // Added default ordering
                $params[] = absint($args['first']);
                $params[] = absint($args['offset']);

                $prepared_sql = $wpdb->prepare($sql, ...$params);
                return $wpdb->get_results($prepared_sql) ?: []; // Return empty array if no results
            },
        ]);

        register_graphql_field('RootQuery', 'nexusClient', [
            'type' => 'NexusClient',
            'args' => ['iD' => ['type' => ['non_null' => 'ID']]],
            'resolve' => function ($root, $args, $context, $info) use ($table_name_clients, $wpdb) {
                $client_id = isset($args['iD']) ? absint($args['iD']) : 0;
                if (empty($client_id)) return null;
                return $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name_clients WHERE ID = %d", $client_id));
            }
        ]);

        register_graphql_field('RootQuery', 'nexusClients', [
            'type'        => ['list_of' => 'NexusClient'],
            'description' => __('Retrieve a list of Nexus Clients', 'nexus-twilio-affiliates'),
            'args'        => [
                'first' => ['type' => 'Int', 'defaultValue' => 10],
                'offset' => ['type' => 'Int', 'defaultValue' => 0],
                'status' => ['type' => 'String'],
                'affiliateId' => ['type' => 'Int'], // Filter by parent affiliate ID
            ],
            'resolve'     => function ($root, $args, $context, $info) use ($table_name_clients, $wpdb) {
                $sql = "SELECT * FROM $table_name_clients";
                $where_clauses = [];
                $params = [];

                if (!empty($args['status'])) {
                    $where_clauses[] = "status = %s";
                    $params[] = sanitize_text_field($args['status']);
                }
                if (!empty($args['affiliateId'])) {
                    $where_clauses[] = "affiliate_id = %d";
                    $params[] = absint($args['affiliateId']);
                }

                if (count($where_clauses) > 0) {
                    $sql .= " WHERE " . implode(" AND ", $where_clauses);
                }

                $sql .= " ORDER BY client_name ASC LIMIT %d OFFSET %d"; // Added default ordering
                $params[] = absint($args['first']);
                $params[] = absint($args['offset']);

                $prepared_sql = $wpdb->prepare($sql, ...$params);
                return $wpdb->get_results($prepared_sql) ?: [];
            },
        ]);

        // The entire block for register_graphql_field('NexusAffiliates', 'clients', ...)
        // that was at the end of your original file has been REMOVED as it was redundant
        // and misplaced. The 'clients' field is correctly defined within the 'NexusAffiliate' type.
    }
}

NexusGraphQLTypeRegistrar::init();
