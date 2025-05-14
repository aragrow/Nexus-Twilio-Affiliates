<?php

/**
 * GraphQL Type Registrations for Nexus Twilio Affiliates
 */

// Exit if accessed directly or WPGraphQL isn't active
if (! defined('ABSPATH')) {
    return;
}
class NexusGraphQLTypeRegistrar
{

    public static function init()
    {
        error_log(__CLASS__ . '::' . __METHOD__); // Debugging line
        add_action('graphql_register_types', [__CLASS__, 'register_custom_types']);
    }

    public static function register_custom_types()
    {
        error_log(__CLASS__ . '::' . __METHOD__); // Debugging line
        global $wpdb; // We'll need this for resolvers

        $table_name_affiliates = $wpdb->prefix . 'nexus_affiliates';
        $table_name_clients    = $wpdb->prefix . 'nexus_clients';
        $table_name_clients    = $wpdb->prefix . 'nexus_twilio_clients';

        // --- Register NexusClient Type ---
        register_graphql_object_type('NexusClient', [
            'description' => __('A client associated with a Nexus Affiliate', 'nexus-twilio-affiliates'),
            'fields'      => [
                'iD' => [
                    'type'        => 'ID', // GraphQL ID type
                    'description' => __('The unique ID of the client', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) { // $client_row is the raw data from DB
                        return ! empty($client_row->client_id) ? (int) $client_row->client_id : null;
                    }
                ],
                'affiliateId' => [ // Use 'databaseId' convention for clarity if it's the DB primary key
                    'type'        => 'Int',
                    'description' => __('The database ID of the affiliate this client belongs to', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) {
                        return ! empty($client_row->affiliate_id) ? (int) $client_row->affiliate_id : null;
                    }
                ],
                'wpUserId' => [
                    'type'        => 'Int',
                    'description' => __('WordPress User ID if the client has a WP account', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) {
                        return ! empty($client_row->wp_user_id) ? (int) $client_row->wp_user_id : null;
                    }
                ],
                'clientName' => [
                    'type'        => 'String',
                    'description' => __('Name of the client', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) {
                        return ! empty($client_row->client_name) ? (string) $client_row->client_name : null;
                    }
                ],
                'clientEmail' => [
                    'type'        => 'String',
                    'description' => __('Email of the client', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) {
                        return ! empty($client_row->client_email) ? (string) $client_row->client_email : null;
                    }
                ],
                'clientPhone' => [
                    'type'        => 'String',
                    'description' => __('Phone number of the client', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) {
                        return ! empty($client_row->client_phone) ? (string) $client_row->client_phone : null;
                    }
                ],
                'affiliateRatePerMinute' => [
                    'type'        => 'Float',
                    'description' => __('Rate per minute charged to the client by the affiliate', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) {
                        return isset($client_row->affiliate_rate_per_minute) ? (float) $client_row->affiliate_rate_per_minute : null;
                    }
                ],
                'status' => [
                    'type'        => 'String', // Could be an Enum if you have fixed statuses
                    'description' => __('Status of the client', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) {
                        return ! empty($client_row->status) ? (string) $client_row->status : null;
                    }
                ],
                'createdAt' => [
                    'type' => 'String', // Or a custom GraphQL Date Scalar if you register one
                    'description' => __('Creation date of the client', 'nexus-twilio-affiliates'),
                    'resolve' => function ($client_row) {
                        return ! empty($client_row->created_at) ? (string) $client_row->created_at : null;
                    }
                ],
                // Field to connect to the parent Affiliate (Example)
                'affiliate' => [
                    'type' => 'NexusAffiliate', // Connects to the NexusAffiliate type
                    'description' => __('The affiliate this client belongs to', 'nexus-twilio-affiliates'),
                    'resolve' => function ($client_row, $args, $context, $info) use ($table_name_affiliates, $wpdb) {
                        if (empty($client_row->affiliate_id)) {
                            return null;
                        }
                        $affiliate_data = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name_affiliates WHERE affiliate_id = %d", $client_row->affiliate_id));
                        return $affiliate_data; // WPGraphQL will use NexusAffiliate resolvers for this
                    }
                ]
            ],
        ]);

        // --- Register NexusAffiliate Type ---
        register_graphql_object_type('NexusAffiliate', [
            'description' => __('A Nexus Twilio Affiliate', 'nexus-twilio-affiliates'),
            'fields'      => [
                'ID' => [
                    'type'        => 'ID',
                    'description' => __('The unique ID of the affiliate', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($affiliate_row) {
                        return ! empty($affiliate_row->ID) ? (int) $affiliate_row->ID : null;
                    }
                ],
                'wpUserId' => [
                    'type'        => 'Int',
                    'description' => __('WordPress User ID of the affiliate', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($affiliate_row) {
                        return ! empty($affiliate_row->wp_user_id) ? (int) $affiliate_row->wp_user_id : null;
                    }
                ],
                'companyName' => [
                    'type'        => 'String',
                    'description' => __('Company name of the affiliate', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($affiliate_row) {
                        return ! empty($affiliate_row->company_name) ? (string) $affiliate_row->company_name : null;
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
                    'type'        => 'String', // Consider an Enum
                    'description' => __('Status of the affiliate', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($affiliate_row) {
                        return ! empty($affiliate_row->status) ? (string) $affiliate_row->status : null;
                    }
                ],
                'createdAt' => [
                    'type' => 'String',
                    'description' => __('Creation date of the affiliate', 'nexus-twilio-affiliates'),
                    'resolve' => function ($affiliate_row) {
                        return ! empty($affiliate_row->created_at) ? (string) $affiliate_row->created_at : null;
                    }
                ],
                // Connection to NexusClient (List of clients for this affiliate)
                'clients' => [
                    'type'        => ['list_of' => 'NexusClient'], // A list of NexusClient objects
                    'description' => __('Clients associated with this affiliate', 'nexus-twilio-affiliates'),
                    'args' => [ // Optional: Add arguments for filtering/pagination
                        'first' => [
                            'type' => 'Int',
                            'description' => __('Number of clients to fetch', 'nexus-twilio-affiliates'),
                        ],
                        'after' => [ // For cursor-based pagination
                            'type' => 'String',
                            'description' => __('Fetch clients after this cursor', 'nexus-twilio-affiliates'),
                        ]
                    ],
                    'resolve'     => function ($affiliate_row, $args, $context, $info) use ($table_name_clients, $wpdb) {
                        if (empty($affiliate_row->affiliate_id)) {
                            return []; // Or null
                        }
                        // Basic resolver without pagination for now
                        // Add LIMIT, OFFSET or WHERE clauses based on $args for pagination/filtering
                        $client_rows = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table_name_clients WHERE affiliate_id = %d", $affiliate_row->affiliate_id));
                        return ! empty($client_rows) ? $client_rows : [];
                    }
                ],
                // Add other affiliate fields: contactName, contactEmail, contactPhone, twilioTwimlAppSid etc.
                // Example:
                'contactName' => [
                    'type' => 'String',
                    'resolve' => function ($affiliate_row) {
                        return $affiliate_row->contact_name ?? null;
                    }
                ]
            ],
        ]);

        // --- Register Root Queries ---
        register_graphql_field('RootQuery', 'nexusAffiliate', [
            'type'        => 'NexusAffiliate',
            'description' => __('Retrieve a single Nexus Affiliate by ID', 'nexus-twilio-affiliates'),
            'args'        => [
                'iD' => [
                    'type'        => ['non_null' => 'iD'], // Non-null ID argument
                    'description' => __('The affiliate_id of the affiliate to retrieve.', 'nexus-twilio-affiliates'),
                ],
            ],
            'resolve'     => function ($root, $args, $context, $info) use ($table_name_affiliates, $wpdb) {
                $affiliate_id = absint($args['iD']); // Sanitize
                if (empty($affiliate_id)) {
                    return null;
                }
                $affiliate_row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name_affiliates WHERE ID = %d", $affiliate_id));
                return $affiliate_row; // WPGraphQL will use NexusAffiliate type resolvers for this object
            },
        ]);

        register_graphql_field('RootQuery', 'nexusAffiliates', [
            'type'        => ['list_of' => 'NexusAffiliate'],
            'description' => __('Retrieve a list of Nexus Affiliates', 'nexus-twilio-affiliates'),
            'args'        => [ // Example: Basic pagination and filtering
                'first' => ['type' => 'Int', 'defaultValue' => 10],
                'offset' => ['type' => 'Int', 'defaultValue' => 0],
                'status' => ['type' => 'String'],
            ],
            'resolve'     => function ($root, $args, $context, $info) use ($table_name_affiliates, $wpdb) {
                // Capability check (example)
                // if ( ! current_user_can( 'view_nexus_affiliates' ) ) { // Define this capability
                //     throw new \GraphQL\Error\UserError( __( 'Permission denied.', 'nexus-twilio-affiliates' ) );
                // }

                $sql = "SELECT * FROM $table_name_affiliates";
                $where_clauses = [];
                $params = [];

                if (! empty($args['status'])) {
                    $where_clauses[] = "status = %s";
                    $params[] = sanitize_text_field($args['status']);
                }

                if (count($where_clauses) > 0) {
                    $sql .= " WHERE " . implode(" AND ", $where_clauses);
                }

                $sql .= " LIMIT %d OFFSET %d";
                $params[] = absint($args['first']);
                $params[] = absint($args['offset']);

                if (count($params) > 0) {
                    $prepared_sql = $wpdb->prepare($sql, ...$params);
                } else {
                    $prepared_sql = $sql; // Should not happen with LIMIT/OFFSET defaults
                }

                $affiliate_rows = $wpdb->get_results($prepared_sql);
                return ! empty($affiliate_rows) ? $affiliate_rows : [];
            },
        ]);

        // --- Register NexusClient Root Queries (similar to above) ---
        register_graphql_field('RootQuery', 'nexusClient', [
            'type' => 'NexusClient',
            'args' => ['iD' => ['type' => ['non_null' => 'iD']]],
            'resolve' => function ($root, $args, $context, $info) use ($table_name_clients, $wpdb) {
                $client_id = absint($args['iD']);
                if (empty($client_id)) return null;
                return $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name_clients WHERE ID = %d", $client_id));
            }
        ]);

        register_graphql_field(
            'RootQuery',
            'nexusClients',
            [
                'type'        => ['list_of' => 'NexusClient'],
                'description' => __('Retrieve a list of Nexus Clients', 'nexus-twilio-affiliates'),
                'args'        => [
                    'first' => ['type' => 'Int', 'defaultValue' => 10],
                    'offset' => ['type' => 'Int', 'defaultValue' => 0],
                    'status' => ['type' => 'String'],
                    'affiliateId' => ['type' => 'Int'],
                ],
                'resolve'     => function ($root, $args, $context, $info) use ($table_name_clients, $wpdb) {
                    $sql = "SELECT * FROM $table_name_clients";
                    $where_clauses = [];
                    $params = [];

                    if (! empty($args['status'])) {
                        $where_clauses[] = "status = %s";
                        $params[] = sanitize_text_field($args['status']);
                    }

                    if (! empty($args['affiliateId'])) {
                        $where_clauses[] = "affiliate_id = %d";
                        $params[] = absint($args['affiliateId']);
                    }

                    if (count($where_clauses) > 0) {
                        $sql .= " WHERE " . implode(" AND ", $where_clauses);
                    }

                    $sql .= " LIMIT %d OFFSET %d";
                    $params[] = absint($args['first']);
                    $params[] = absint($args['offset']);

                    $prepared_sql = $wpdb->prepare($sql, ...$params);
                    $client_rows = $wpdb->get_results($prepared_sql);

                    return ! empty($client_rows) ? $client_rows : [];
                },
            ]
        );

        // Other root queries here...
    }
}

// Initialize the class
NexusGraphQLTypeRegistrar::init();
