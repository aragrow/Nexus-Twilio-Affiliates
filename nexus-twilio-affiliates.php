<?php

/**
 * Plugin Name:       Nexus Twilio Affiliates
 * Plugin URI:        https://yourwebsite.com/nexus-twilio-affiliates
 * Description:       Manages Affiliates and Clients for Twilio integration, including custom roles and database tables. Designed for GraphQL access.
 * Version:           1.0.0
 * Author:            David Arago / ARAGROW LL
 * Author URI:        https://yourwebsite.com/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       nexus-twilio-affiliates
 * Domain Path:       /languages
 */

// Exit if accessed directly.
if (! defined('ABSPATH')) {
	exit;
}

// Define constants
define('NEXUS_TWILIO_VERSION', '1.0.0');
define('NEXUS_TWILIO_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('NEXUS_TWILIO_PLUGIN_URL', plugin_dir_url(__FILE__));
define('NEXUS_TWILIO_PLUGIN_FILE', __FILE__);


// Include Composer Autoloader
if (file_exists(NEXUS_TWILIO_PLUGIN_DIR . 'vendor/autoload.php')) {
	require_once NEXUS_TWILIO_PLUGIN_DIR . 'vendor/autoload.php';
}

/**
 * The core plugin class that initializes everything.
 */
final class Nexus_Twilio_Affiliates
{

	/**
	 * Plugin instance.
	 *
	 * @var Nexus_Twilio_Affiliates
	 */
	private static $instance;

	/**
	 * Instance.
	 * Ensures only one instance of the plugin class is loaded or can be loaded.
	 */
	public static function instance()
	{
		if (is_null(self::$instance)) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct()
	{
		$this->includes();
		$this->init_hooks();
	}

	/**
	 * Include required files.
	 */
	private function includes()
	{
		error_log(__CLASS__ . '::' . __FUNCTION__);
		// Include necessary files
		require_once NEXUS_TWILIO_PLUGIN_DIR . 'includes/class-nexus-installer.php';
		require_once NEXUS_TWILIO_PLUGIN_DIR . 'includes/class-nexus-data-seeder.php'; // Ensure class is loaded
		require_once NEXUS_TWILIO_PLUGIN_DIR . 'includes/graphql/register-types.php'; // Ensure class is loaded

		// --- Future Includes ---
		// require_once NEXUS_TWILIO_PLUGIN_DIR . 'includes/graphql/register-types.php';
		// require_once NEXUS_TWILIO_PLUGIN_DIR . 'includes/twilio/class-nexus-twilio-handler.php';
		// require_once NEXUS_TWILIO_PLUGIN_DIR . 'includes/admin/admin-pages.php';
		// require_once NEXUS_TWILIO_PLUGIN_DIR . 'includes/woocommerce/class-nexus-wc-integration.php';
	}

	/**
	 * Initialize hooks.
	 */
	private function init_hooks()
	{
		error_log(__CLASS__ . '::' . __FUNCTION__);
		// Activation hook
		register_activation_hook(NEXUS_TWILIO_PLUGIN_FILE, array('Nexus_Installer', 'activate'));
		// Deactivation hook (optional)
		register_deactivation_hook(NEXUS_TWILIO_PLUGIN_FILE, array('Nexus_Installer', 'deactivate'));

		// Load text domain for translation
		add_action('plugins_loaded', array($this, 'load_textdomain'));

		// --- Future Hooks ---
		// Example: add_action( 'init', array( 'Nexus_Twilio_Handler', 'init' ) );
		// Example: add_action( 'graphql_register_types', 'nexus_register_graphql_types_and_fields' ); // Function defined in graphql/register-types.php
	}

	/**
	 * Load plugin textdomain.
	 */
	public function load_textdomain()
	{
		error_log(__CLASS__ . '::' . __FUNCTION__);
		load_plugin_textdomain('nexus-twilio-affiliates', false, dirname(plugin_basename(NEXUS_TWILIO_PLUGIN_FILE)) . '/languages');
	}
}

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function nexus_twilio_affiliates_run()
{
	error_log(__CLASS__ . '::' . __FUNCTION__);
	// Load the plugin
	return Nexus_Twilio_Affiliates::instance();
}
// Get the plugin running.
nexus_twilio_affiliates_run();

add_action('admin_init', 'nexus_maybe_generate_seed_sql');
function nexus_maybe_generate_seed_sql()
{
	error_log(__CLASS__ . '::' . __FUNCTION__);
	// Check for a specific query parameter and nonce for security
	// Ensure current user can manage options
	if (
		isset($_GET['nexus_generate_seed_sql']) &&
		$_GET['nexus_generate_seed_sql'] === 'yes' &&
		current_user_can('manage_options')
	) {

		if (class_exists('Nexus_Data_Seeder')) {
			$sql_statements = Nexus_Data_Seeder::execute_seeding(50, 10);

			// Store in a transient to display in an admin notice
			set_transient('nexus_generated_seed_sql', 'yes', HOUR_IN_SECONDS);
			//Save to a file
			//file_put_contents(WP_CONTENT_DIR . '/nexus-seed.sql', $sql_statements);

			// Redirect to avoid re-triggering on refresh and to show the notice
			wp_redirect(remove_query_arg(array('nexus_generate_seed_sql', '_wpnonce')));
			exit;
		} else {
			error_log("Nexus_Data_Seeder class not found when trying to generate SQL.");
		}
	}
}

add_action('admin_notices', 'nexus_seed_sql_admin_notice');
function nexus_seed_sql_admin_notice()
{
	error_log(__CLASS__ . '::' . __FUNCTION__);
	if ($sql = get_transient('nexus_generated_seed_sql')) {
		echo '<div class="notice notice-success is-dismissible" style="max-height: 400px; overflow-y: auto;">';
		echo '<p><strong>Nexus Twilio Affiliates - Generated Seed SQL:</strong></p>';
		//     echo '<pre style="white-space: pre-wrap; word-break: break-all;">' . esc_textarea($sql) . '</pre>';
		echo '</div>';
		delete_transient('nexus_generated_seed_sql');
	}
}

/** 
 *add_action('plugins_loaded', 'nexus_check_graphql_active');
 *function nexus_check_graphql_active()
 *{*
 *	if (function_exists('graphql_require_bootstrap_files')) {
 *		error_log("WPGraphQL is active.");
 *		require_once NEXUS_TWILIO_PLUGIN_DIR . 'includes/graphql/register-types.php';
 *	} else {
 *		error_log("WPGraphQL is not active.");
 *	}
 *-
 */
/**
 * Preflight handler for REST API requests in the Aragrow Timegrow Nexus plugin.
 *
 * This function is triggered before REST API requests are processed. It can be used
 * to perform custom logic, such as debugging, modifying requests, or short-circuiting
 * the request handling process.
 *
 * @param mixed           $result   Response object or null. Return non-null to short-circuit.
 * @param WP_REST_Server  $server   Server instance.
 * @param WP_REST_Request $request  Request instance.
 * @return mixed Original $result or null to continue processing.
 */

function nexus_twilio_rest_preflight($served, $result, $request, $server)
{
	error_log(__CLASS__ . '::' . __FUNCTION__);
	if (isset($_SERVER['HTTP_ORIGIN']) && strpos($_SERVER['HTTP_ORIGIN'], 'localhost:5173') !== false) {
		header('Access-Control-Allow-Origin: *');
		header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH');
		header('Access-Control-Allow-Credentials: true');
		header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');
	}
	return $served;
}
add_action('rest_api_init', function () {
	add_filter('rest_pre_serve_request', 'nexus_twilio_rest_preflight', 10, 4);
});
/** */
// Hook the register_routes method to the rest_api_init action
//add_action('rest_api_init', ['Nexus_Twilio_Custom_Endpoints', 'register_routes']);
/**
 * 1. WPGraphQL Settings - "Public Introspection" and "Default Field Access":
 * Go to your WordPress Admin -> GraphQL -> Settings -> General Settings.
 * Public Introspection: If this is turned OFF, the schema itself (including your custom types and fields) might not be accessible without authentication, 
 * which can lead to issues even if specific fields should be public. For development, you might want this ON. For production, consider the security implications.
 * Default access to GraphQL Fields (Public): This setting (if it exists in your WPGraphQL version or an extension) might control whether new fields 
 * are public by default or require authentication.
 * Authenticated requests only: There might be a global setting to restrict all GraphQL requests to authenticated users.
 * If you want this particular nexusAffiliate query to be publicly accessible (meaning anyone can query it without logging in), you need to adjust 
 * 		how it's registered or how WPGraphQL handles public access.
 */


/**
 * affiliate_alfredo.lehner38
 * CFbj Szdi RCn6 JS6H B1WS 0ITW
 * A9iG5r7PRuxD3TjckQc(X)rO
 */

/**
 * Note: For security, we highly recommend, that the Auth Token is short lived. So do not set this higher than 300 seconds unless 
 * you know what you are doing.
 */
function custom_jwt_expiration($expiration)
{
	return 300;
}

add_filter('graphql_jwt_auth_expire', 'custom_jwt_expiration', 10);

add_filter('graphql_jwt_auth_whitelist_fields', function ($fields) {
	if (!in_array('login', $fields)) {
		$fields[] = 'login';
	}
	return $fields;
}, 10, 1);
