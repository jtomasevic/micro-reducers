const Notification = (function () {
    let message; // hold our state in module scope
    let notificatioCallBack;
    return {
        useNotifcation(callBack) {
            notificatioCallBack = callBack;
            return [message];
        },
        sendNotification(msg) {
            message = msg;
            notificatioCallBack(message);
        }
    };
}());
const useNotification = Notification.useNotifcation;
const sendNotification = Notification.sendNotification;
export { useNotification, sendNotification };