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
        $table_name_entities    = $wpdb->prefix . 'nexus_entities'; // If needed for other types
        $table_name_twilio_data = $wpdb->prefix . 'nexus_twilio_data';
        $table_name_workflows = $wpdb->prefix . 'nexus_workflows';
        $table_name_workflow_entities = $wpdb->prefix . 'nexus_workflow_entities';

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
                'accountno' => [
                    'type'        => 'String',
                    'description' => __('Account number of the client', 'nexus-twilio-affiliates'),
                    'resolve'     => function ($client_row) {
                        return !empty($client_row->account_no) ? (string) $client_row->account_no : null;
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

        // --- NEW: Register NexusEntity Type ---
        register_graphql_object_type('NexusEntity', [
            'description' => __('An entity belonging to a client (e.g., a phone line, service)', 'nexus-twilio-affiliates'),
            'fields' => [
                'iD' => [
                    'type' => 'ID',
                    'description' => __('The unique ID of the entity', 'nexus-twilio-affiliates'),
                    'resolve' => fn($row) => !empty($row->ID) ? (int) $row->ID : null,
                ],
                'clientId' => [
                    'type' => 'Int',
                    'description' => __('The ID of the client this entity belongs to', 'nexus-twilio-affiliates'),
                    'resolve' => fn($row) => !empty($row->client_id) ? (int) $row->client_id : null,
                ],
                'entityType' => [ // Note: 'entity_type' in your DB schema has a typo
                    'type' => 'String',
                    'description' => __('Type of the entity', 'nexus-twilio-affiliates'),
                    'resolve' => fn($row) => $row->entity_type ?? null, // Matching DB schema typo
                ],
                'entityName' => [ // Note: 'entity_name' in your DB schema
                    'type' => 'String',
                    'description' => __('Name of the entity', 'nexus-twilio-affiliates'),
                    'resolve' => fn($row) => $row->entity_name ?? null, // Matching DB schema typo
                ],
                'entityPhone' => [
                    'type' => 'String',
                    'description' => __('Phone number associated with the entity', 'nexus-twilio-affiliates'),
                    'resolve' => fn($row) => $row->entity_phone ?? null,
                ],
                'ratePerMinute' => [
                    'type' => 'Float',
                    'description' => __('Rate per minute for this entity', 'nexus-twilio-affiliates'),
                    'resolve' => fn($row) => isset($row->rate_per_minute) ? (float) $row->rate_per_minute : null,
                ],
                'entityStatus' => [
                    'type' => 'String',
                    'description' => __('Status of the entity', 'nexus-twilio-affiliates'),
                    'resolve' => fn($row) => $row->entity_status ?? null,
                ],
                'createdAt' => [
                    'type' => 'String',
                    'description' => __('Creation date of the entity', 'nexus-twilio-affiliates'),
                    'resolve' => fn($row) => $row->created_at ?? null,
                ],
                'updatedAt' => [
                    'type' => 'String',
                    'description' => __('Update date of the entity', 'nexus-twilio-affiliates'),
                    'resolve' => fn($row) => $row->updated_at ?? null,
                ],
                // Connection from Entity back to its Client
                'client' => [
                    'type' => 'NexusClient',
                    'description' => __('The client this entity belongs to', 'nexus-twilio-affiliates'),
                    'resolve' => function ($entity_row, $args, $context, $info) use ($table_name_clients, $wpdb) {
                        if (empty($entity_row->client_id)) return null;
                        return $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name_clients WHERE ID = %d", $entity_row->client_id));
                    }
                ],
                // --- NEW: Connection from Entity to its TwilioData ---
                'twilioDataEntries' => [
                    'type' => ['list_of' => 'NexusTwilioData'],
                    'description' => __('Twilio data entries (charges) for this entity\'s phone number', 'nexus-twilio-affiliates'),
                    'args' => [ // Optional arguments for filtering TwilioData
                        'startDate' => ['type' => 'String', 'description' => 'Filter by charge_date on or after this date (YYYY-MM-DD)'],
                        'endDate'   => ['type' => 'String', 'description' => 'Filter by charge_date on or before this date (YYYY-MM-DD)'],
                    ],
                    'resolve' => function ($entity_row, $args, $context, $info) use ($table_name_twilio_data, $wpdb) {
                        if (empty($entity_row->entity_phone)) return [];

                        $sql = "SELECT * FROM $table_name_twilio_data WHERE charge_to_phone = %s";
                        $params = [$entity_row->entity_phone];

                        if (!empty($args['startDate'])) {
                            $sql .= " AND charge_date >= %s";
                            $params[] = $args['startDate'] . ' 00:00:00'; // Assuming YYYY-MM-DD input
                        }
                        if (!empty($args['endDate'])) {
                            $sql .= " AND charge_date <= %s";
                            $params[] = $args['endDate'] . ' 23:59:59'; // Assuming YYYY-MM-DD input
                        }
                        $sql .= " ORDER BY charge_date DESC"; // Example ordering

                        return $wpdb->get_results($wpdb->prepare($sql, ...$params)) ?: [];
                    }
                ]
            ]
        ]);

        // --- NEW: Register NexusTwilioData Type ---
        register_graphql_object_type('NexusTwilioData', [
            'description' => __('A Twilio data entry, representing a charge or usage record', 'nexus-twilio-affiliates'),
            'fields' => [
                'iD' => [
                    'type' => 'ID',
                    'description' => __('The unique ID of the Twilio data record', 'nexus-twilio-affiliates'),
                    'resolve' => fn($row) => !empty($row->ID) ? (int) $row->ID : null,
                ],
                'chargeDate' => [
                    'type' => 'String', // Or a custom GraphQL Date scalar
                    'description' => __('Date of the charge', 'nexus-twilio-affiliates'),
                    'resolve' => fn($row) => $row->charge_date ?? null,
                ],
                'chargeToPhone' => [
                    'type' => 'String',
                    'description' => __('The phone number the charge is associated with', 'nexus-twilio-affiliates'),
                    'resolve' => fn($row) => $row->charge_to_phone ?? null,
                ],
                'chargeNoMinutes' => [
                    'type' => 'Float', // DB is DECIMAL(10,2)
                    'description' => __('Number of minutes for the charge', 'nexus-twilio-affiliates'),
                    'resolve' => fn($row) => isset($row->charge_no_minutes) ? (float) $row->charge_no_minutes : null,
                ],
                'chargeDollars' => [
                    'type' => 'Float', // DB is DECIMAL(10,2)
                    'description' => __('Charge amount in dollars', 'nexus-twilio-affiliates'),
                    'resolve' => fn($row) => isset($row->charge_dollars) ? (float) $row->charge_dollars : null,
                ],
                'createdAt' => [
                    'type' => 'String',
                    'description' => __('Creation date of the record', 'nexus-twilio-affiliates'),
                    'resolve' => fn($row) => $row->created_at ?? null,
                ],
                // Connection from TwilioData back to the Entity (via phone number)
                'entity' => [
                    'type' => 'NexusEntity',
                    'description' => __('The entity associated with this Twilio data entry\'s phone number', 'nexus-twilio-affiliates'),
                    'resolve' => function ($twilio_data_row, $args, $context, $info) use ($table_name_entities, $wpdb) {
                        if (empty($twilio_data_row->charge_to_phone)) return null;
                        return $wpdb->get_row(
                            $wpdb->prepare("SELECT * FROM $table_name_entities WHERE entity_phone = %s", $twilio_data_row->charge_to_phone)
                        );
                    }
                ]
            ]
        ]);

        // --- Register nexusWorkFlowStep (represents an entry in nexus_workflow_entities) ---
        register_graphql_object_type('nexusWorkFlowStep', [
            'description' => __('An entity step within a Nexus Workflow', 'nexus-twilio-affiliates'),
            'fields'      => [
                'iD' => [ // ID of the nexus_workflow_entities row
                    'type'        => 'ID',
                    'resolve'     => fn($row) => !empty($row->ID) ? (int) $row->ID : null,
                ],
                'workflowId' => [
                    'type'        => 'Int',
                    'description' => __('ID of the parent workflow', 'nexus-twilio-affiliates'),
                    'resolve'     => fn($row) => !empty($row->workflow_id) ? (int) $row->workflow_id : null,
                ],
                'entityId' => [
                    'type'        => 'Int',
                    'description' => __('ID of the Nexus Entity in this step', 'nexus-twilio-affiliates'),
                    'resolve'     => fn($row) => !empty($row->entity_id) ? (int) $row->entity_id : null,
                ],
                'workflowOrder' => [
                    'type'        => 'Int',
                    'description' => __('The order of this step in the workflow', 'nexus-twilio-affiliates'),
                    'resolve'     => fn($row) => isset($row->workflow_order) ? (int) $row->workflow_order : null,
                ],
                'stepStatus' => [ // Status of this particular step definition
                    'type'        => 'String',
                    'description' => __('Status of this workflow step', 'nexus-twilio-affiliates'),
                    'resolve'     => fn($row) => $row->step_status ?? null,
                ],
                // Connection to the actual NexusEntity
                'entity' => [
                    'type' => 'NexusEntity', // Assumes NexusEntity type is already registered
                    'description' => __('The Nexus Entity details for this step', 'nexus-twilio-affiliates'),
                    'resolve' => function ($workflow_step_row) use ($table_name_entities, $wpdb) {
                        if (empty($workflow_step_row->entity_id)) return null;
                        return $wpdb->get_row(
                            $wpdb->prepare("SELECT * FROM $table_name_entities WHERE ID = %d", $workflow_step_row->entity_id)
                        );
                    }
                ],
                // Connection back to the parent Workflow
                'workflow' => [
                    'type' => 'nexusWorkFlow',
                    'description' => __('The parent workflow this step belongs to', 'nexus-twilio-affiliates'),
                    'resolve' => function ($workflow_step_row) use ($table_name_workflows, $wpdb) {
                        if (empty($workflow_step_row->workflow_id)) return null;
                        return $wpdb->get_row(
                            $wpdb->prepare("SELECT * FROM $table_name_workflows WHERE ID = %d", $workflow_step_row->workflow_id)
                        );
                    }
                ]
            ],
        ]);

        // --- Register nexusWorkFlow Type ---
        register_graphql_object_type('nexusWorkFlow', [
            'description' => __('A Nexus Workflow definition', 'nexus-twilio-affiliates'),
            'fields'      => [
                'iD' => [
                    'type'        => 'ID',
                    'resolve'     => fn($row) => !empty($row->ID) ? (int) $row->ID : null,
                ],
                'clientId' => [
                    'type'        => 'Int',
                    'description' => __('ID of the client this workflow belongs to', 'nexus-twilio-affiliates'),
                    'resolve'     => fn($row) => !empty($row->client_id) ? (int) $row->client_id : null,
                ],
                'workFlowName' => [
                    'type'        => 'String',
                    'resolve'     => fn($row) => $row->workflow_name ?? null,
                ],
                'workFlowStatus' => [
                    'type'        => 'String',
                    'resolve'     => fn($row) => $row->workflow_status ?? null,
                ],
                'createdAt' => [
                    'type'        => 'String',
                    'resolve'     => fn($row) => $row->created_at ?? null,
                ],
                'updatedAt' => [
                    'type'        => 'String',
                    'resolve'     => fn($row) => $row->updated_at ?? null,
                ],
                // Connection to the Client
                'client' => [
                    'type' => 'NexusClient', // Assumes NexusClient type is registered
                    'description' => __('The client this workflow belongs to', 'nexus-twilio-affiliates'),
                    'resolve' => function ($workflow_row) use ($table_name_clients, $wpdb) {
                        if (empty($workflow_row->client_id)) return null;
                        return $wpdb->get_row(
                            $wpdb->prepare("SELECT * FROM $table_name_clients WHERE ID = %d", $workflow_row->client_id)
                        );
                    }
                ],
                // Connection to its steps (ordered)
                'steps' => [
                    'type' => ['list_of' => 'nexusWorkFlowStep'],
                    'description' => __('The ordered steps (entities) in this workflow', 'nexus-twilio-affiliates'),
                    'resolve' => function ($workflow_row) use ($table_name_workflow_entities, $wpdb) {
                        if (empty($workflow_row->ID)) return [];
                        return $wpdb->get_results(
                            $wpdb->prepare(
                                "SELECT * FROM $table_name_workflow_entities WHERE workflow_id = %d ORDER BY workflow_order ASC",
                                $workflow_row->ID
                            )
                        ) ?: [];
                    }
                ]
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
                'first' => ['type' => 'Int', 'defaultValue' => 100],
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
                'first' => ['type' => 'Int', 'defaultValue' => 100],
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

        register_graphql_field('RootQuery', 'nexusEntity', [
            'type' => 'NexusEntity',
            'description' => __('Retrieve a single Nexus Entity by ID', 'nexus-twilio-affiliates'),
            'args' => ['iD' => ['type' => ['non_null' => 'ID']]],
            'resolve' => function ($root, $args, $context, $info) use ($table_name_entities, $wpdb) {
                $entity_id = isset($args['iD']) ? absint($args['iD']) : 0;
                if (empty($entity_id)) return null;
                return $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name_entities WHERE ID = %d", $entity_id));
            }
        ]);


        register_graphql_field('RootQuery', 'nexusEntities', [
            'type' => ['list_of' => 'NexusEntity'],
            'description' => __('Retrieve a list of Nexus Entities', 'nexus-twilio-affiliates'),
            'args' => [
                'first' => ['type' => 'Int', 'defaultValue' => 100],
                'offset' => ['type' => 'Int', 'defaultValue' => 0],
                'clientId' => ['type' => 'Int', 'description' => 'Filter by client ID'],
                'entityType' => ['type' => 'String'],
                'entityStatus' => ['type' => 'String'],
                'entityPhone' => ['type' => 'String'],
            ],
            'resolve' => function ($root, $args, $context, $info) use ($table_name_entities, $wpdb) {
                $sql = "SELECT * FROM $table_name_entities";
                $where_clauses = [];
                $params = [];

                if (!empty($args['clientId'])) {
                    $where_clauses[] = "client_id = %d";
                    $params[] = absint($args['clientId']);
                }
                if (!empty($args['entityType'])) {
                    $where_clauses[] = "entity_type = %s"; // DB typo
                    $params[] = $args['entityType'];
                }
                if (!empty($args['entityStatus'])) {
                    $where_clauses[] = "entity_status = %s";
                    $params[] = $args['entityStatus'];
                }
                if (!empty($args['entityPhone'])) {
                    $where_clauses[] = "entity_phone = %s";
                    $params[] = $args['entityPhone'];
                }

                if (count($where_clauses) > 0) {
                    $sql .= " WHERE " . implode(" AND ", $where_clauses);
                }
                $sql .= " ORDER BY entity_name ASC LIMIT %d OFFSET %d"; // DB typo
                $params[] = absint($args['first']);
                $params[] = absint($args['offset']);

                return $wpdb->get_results($wpdb->prepare($sql, ...$params)) ?: [];
            }
        ]);

        // --- NEW: Root Queries for NexusTwilioData ---
        register_graphql_field('RootQuery', 'nexusTwilioDataEntry', [ // Singular
            'type' => 'NexusTwilioData',
            'description' => __('Retrieve a single Nexus Twilio Data entry by ID', 'nexus-twilio-affiliates'),
            'args' => [
                'iD' => ['type' => ['non_null' => 'ID']],
            ],
            'resolve' => function ($root, $args, $context, $info) use ($table_name_twilio_data, $wpdb) {
                $data_id = absint($args['iD']);
                if (empty($data_id)) return null;
                return $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name_twilio_data WHERE ID = %d", $data_id));
            }
        ]);

        register_graphql_field('RootQuery', 'nexusTwilioDataEntries', [ // Plural
            'type' => ['list_of' => 'NexusTwilioData'],
            'description' => __('Retrieve a list of Nexus Twilio Data entries', 'nexus-twilio-affiliates'),
            'args' => [
                'first' => ['type' => 'Int', 'defaultValue' => 25],
                'offset' => ['type' => 'Int', 'defaultValue' => 0],
                'chargeToPhone' => ['type' => 'String', 'description' => 'Filter by the phone number charged'],
                'startDate' => ['type' => 'String', 'description' => 'Filter by charge_date on or after this date (YYYY-MM-DD)'],
                'endDate' => ['type' => 'String', 'description' => 'Filter by charge_date on or before this date (YYYY-MM-DD)'],
            ],
            'resolve' => function ($root, $args, $context, $info) use ($table_name_twilio_data, $wpdb) {
                $sql = "SELECT * FROM $table_name_twilio_data";
                $where_clauses = [];
                $params = [];

                if (!empty($args['chargeToPhone'])) {
                    $where_clauses[] = "charge_to_phone = %s";
                    $params[] = $args['chargeToPhone'];
                }
                if (!empty($args['startDate'])) {
                    $where_clauses[] = "charge_date >= %s";
                    $params[] = $args['startDate'] . ' 00:00:00';
                }
                if (!empty($args['endDate'])) {
                    $where_clauses[] = "charge_date <= %s";
                    $params[] = $args['endDate'] . ' 23:59:59';
                }

                if (count($where_clauses) > 0) {
                    $sql .= " WHERE " . implode(" AND ", $where_clauses);
                }
                $sql .= " ORDER BY charge_date DESC, ID DESC LIMIT %d OFFSET %d";
                $params[] = absint($args['first']);
                $params[] = absint($args['offset']);

                return $wpdb->get_results($wpdb->prepare($sql, ...$params)) ?: [];
            }
        ]);

        // --- Root Queries for Workflows ---
        register_graphql_field('RootQuery', 'nexusWorkFlow', [
            'type'        => 'nexusWorkFlow',
            'description' => __('Retrieve a single Nexus Workflow by ID', 'nexus-twilio-affiliates'),
            'args'        => [
                'iD' => ['type' => ['non_null' => 'ID']],
            ],
            'resolve'     => function ($root, $args) use ($table_name_workflows, $wpdb) {
                $workflow_id = absint($args['iD']);
                if (empty($workflow_id)) return null;
                return $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name_workflows WHERE ID = %d", $workflow_id));
            },
        ]);

        register_graphql_field('RootQuery', 'nexusWorkFlows', [
            'type'        => ['list_of' => 'nexusWorkFlow'],
            'description' => __('Retrieve a list of Nexus Workflows', 'nexus-twilio-affiliates'),
            'args'        => [
                'first' => ['type' => 'Int', 'defaultValue' => 100],
                'offset' => ['type' => 'Int', 'defaultValue' => 0],
                'clientId' => ['type' => 'Int'],
                'workFlowName' => ['type' => 'String'],
                'workFlowStatus' => ['type' => 'String']
            ],
            'resolve'     => function ($root, $args) use ($table_name_workflows, $table_name_clients, $wpdb) {
                $sql = "SELECT * FROM $table_name_workflows";
                $where_clauses = [];
                $params = [];

                if (!empty($args['clientId'])) {
                    $where_clauses[] = "a.client_id = %d";
                    $params[] = absint($args['clientId']);
                }
                if (!empty($args['workFlowName'])) {
                    $where_clauses[] = "a.workflow_name = %s";
                    $params[] = sanitize_text_field($args['workFlowName']);
                }
                if (!empty($args['workFlowStatus'])) {
                    $where_clauses[] = "a.workflow_status = %s";
                    $params[] = sanitize_text_field($args['workFlowStatus']);
                }

                if (count($where_clauses) > 0) {
                    $sql .= " WHERE " . implode(" AND ", $where_clauses);
                }
                $sql .= " ORDER BY workflow_name ASC LIMIT %d OFFSET %d";
                $params[] = absint($args['first']);
                $params[] = absint($args['offset']);

                return $wpdb->get_results($wpdb->prepare($sql, ...$params)) ?: [];
            },
        ]);

        // --- Root Queries for Workflow Steps (Optional, usually accessed via Workflow.steps) ---
        // You might not need direct root queries for nexusWorkFlowStep if they are always fetched
        // in the context of a parent nexusWorkFlow. But if needed:
        register_graphql_field('RootQuery', 'nexusWorkFlowStep', [
            'type'        => 'nexusWorkFlowStep',
            'description' => __('Retrieve a single Nexus Workflow Step by its own ID', 'nexus-twilio-affiliates'),
            'args'        => [
                'iD' => ['type' => ['non_null' => 'ID']], // ID from nexus_workflow_entities table
            ],
            'resolve'     => function ($root, $args) use ($table_name_workflow_entities, $wpdb) {
                $step_id = absint($args['iD']);
                if (empty($step_id)) return null;
                return $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name_workflow_entities ID = %d", $step_id));
            },
        ]);
    }
}

NexusGraphQLTypeRegistrar::init();
