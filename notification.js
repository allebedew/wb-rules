function notify_user(text) {
	log("Sending user notification: " + text);
    Notify.sendEmail("allebedew@gmail.com", "Notification", text);
	Notify.sendSms("+380961211156", text);
}