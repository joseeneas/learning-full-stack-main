import { notification } from "antd";
// Helper function to display notifications of various types using Ant Design's notification component.
// @param {string} type - The type of notification ('success', 'error', 'info', 'warning')
// @param {string} message - The main message/title of the notification
// @param {string} description - Additional descriptive text for the notification
// @param {string} placement - The position where the notification will appear (e.g., 'topRight', 'bottomLeft')
// @returns {void}
//
const openNotificationWithIcon = (type, message, description, placement) => {
    placement = placement || "topRight";
    notification[type]({ message, description, placement});
};
/**
 * Displays a success notification to the user.
 * 
 * @param {string} message - The main message/title of the notification
 * @param {string} description - Additional descriptive text for the notification
 * @param {string} placement - The position where the notification will appear (e.g., 'topRight', 'bottomLeft')
 * @returns {void} Calls openNotificationWithIcon with 'success' type and provided parameters
 */
export const successNotification = (message, description, placement) =>
    openNotificationWithIcon('success', message, description, placement);
/**
 * Displays an error notification with the specified message and description.
 * 
 * @param {string} message - The main message to display in the notification
 * @param {string} description - Additional description or details for the notification
 * @param {string} placement - The position where the notification should appear on the screen
 * @returns {void} The result of calling openNotificationWithIcon with 'error' type
 */
export const errorNotification = (message, description, placement) =>
    openNotificationWithIcon('error', message, description, placement);
/**
 * Displays an informational notification message.
 * 
 * @param {string} message - The main message/title of the notification.
 * @param {string} description - The detailed description or body text of the notification.
 * @param {string} placement - The placement position of the notification on the screen (e.g., 'topRight', 'bottomLeft').
 * @returns {void}
 */
export const infoNotification = (message, description, placement) =>
    openNotificationWithIcon('info', message, description, placement);
/**
 * Displays a warning notification to the user.
 * 
 * @param {string} message - The main message/title of the notification
 * @param {string} description - The detailed description text of the notification
 * @param {string} placement - The position where the notification will appear on the screen
 * @returns {void} Calls openNotificationWithIcon with 'warning' type
 */
export const warningNotification = (message, description, placement) =>
    openNotificationWithIcon('warning', message, description, placement);