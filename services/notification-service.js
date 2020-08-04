class NotificationService{
	constructor(admin, doorbellId){
		this.admin = admin;
		this.deviceTokens = {};
		this.doorbellId = doorbellId;
		this.subscribe();

	}
	
	getSettings(tokenResponse){
		return {
			allowedTypes: [],
			receiveNotifications: true,
			...tokenResponse.settings
		}
	}
	
	subscribe(){
		const db = this.admin.database();
		db.ref(`/doorbells/${this.doorbellId}/users`).on('value', (users) =>{
			Object.keys(this.deviceTokens).forEach((uid) =>{
				//unsubcribe
				db.ref(`/users/${uid}/gcm-ids`).off();
			})
			this.deviceTokens = {};

			Object.keys(users.val()).forEach( async (uid) =>{
				db.ref(`/users/${uid}/gcm-ids`).on('value', (token) =>{
					//save 
					this.deviceTokens[uid] = token.val();
					console.log(`deviceTokens[${uid}]`, this.deviceTokens[uid])
				});;
			})
		});
	}

	getDeviceTokensLocal(payload){
		let tokens = [];
		Object.keys(this.deviceTokens).forEach(uid =>{
			const token = this.deviceTokens[uid];
			if(!token){
				console.error(`[ERROR] Could not find token for ${uid}`);
				return;
			}
			const notificationSettings = this.getSettings(token)
			if(!notificationSettings.allowedTypes.includes(payload.notification.type.trim())){
					console.log("This notification was not allowed to be send for this user", uid, notificationSettings.allowedTypes, 'doesnt have:', payload.notification.type)
			}
			if(notificationSettings.receiveNotifications){
				tokens = tokens.concat(Object.keys(token).filter((item) => item !== "settings"))
			}
		})
	
		return tokens;	
	}

	async sendNotification(doorbellId, payload){		
		let tokens = this.getDeviceTokensLocal(payload)
		// Send notifications to all tokens.
		if(tokens.length === 0) return;

		return await this.admin.messaging().sendToDevice(tokens, payload);
	}
}

module.exports = NotificationService