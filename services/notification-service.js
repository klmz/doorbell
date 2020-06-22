class NotificationService{
	constructor(admin){
		this.admin = admin;
	}
	
	getSettings(tokenResponse){
		return {
			allowedTypes: [],
			receiveNotifications: true,
			...tokenResponse.settings
		}
	}
	
	async getDeviceTokens(users, payload){
		let tokenPromises = Object.keys(users.val()).map(async (uid) => {
			const tokenPromise = await this.admin.database()
				.ref(`/users/${uid}/gcm-ids`).once('value');
			const tokenResponse = tokenPromise.val()

			const notificationSettings = this.getSettings(tokenResponse)
			if(!notificationSettings.allowedTypes.includes(payload.notification.type.trim())){
					console.log("This notification was not allowed to be send for this user", uid, notificationSettings.allowedTypes, 'doesnt have:', payload.notification.type)
					return [];
			}
			if(notificationSettings.receiveNotifications){
				return Object.keys(tokenResponse).filter((item) => item !== "settings");
			}
			
			return [];	
		})
		let tokens = await Promise.all(tokenPromises);
		return tokens.reduce((acc, x) => acc.concat(x), []);
	}

	async sendNotification(doorbellId, payload){
		const users = await this.admin.database().ref(`/doorbells/${doorbellId}/users`).once('value');
		let tokens = await this.getDeviceTokens(users, payload);
		
		// Send notifications to all tokens.
		if(tokens.length === 0) return;

		return await this.admin.messaging().sendToDevice(tokens, payload);
	}
}

module.exports = NotificationService