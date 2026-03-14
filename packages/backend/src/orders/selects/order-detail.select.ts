export const orderDetailSelect = {
	id: true,
	orderNumber: true,
	status: true,
	priority: true,
	description: true,
	mileage: true,
	discount: true,
	recommendations: true,
	totalAmount: true,
	startDate: true,
	endDate: true,
	vehicleId: true,
	clientId: true,
	managerId: true,
	mechanicId: true,
	vehicle: {
		select: {
			id: true,
			vin: true,
			brand: true,
			model: true,
			year: true,
			plateNumber: true,
			mileage: true,
			color: true,
			notes: true,
		},
	},
	client: {
		select: {
			id: true,
			fullName: true,
			email: true,
			phone: true,
			notes: true,
		},
	},
	manager: {
		select: {
			id: true,
			fullName: true,
			avatar: true,
		},
	},
	mechanic: {
		select: {
			id: true,
			fullName: true,
			avatar: true,
			role: true,
		},
	},
	parts: {
		select: {
			id: true,
			quantity: true,
			price: true,
			part: {
				select: {
					id: true,
					name: true,
					sku: true,
					unit: true,
				},
			},
		},
	},
	services: {
		select: {
			id: true,
			quantity: true,
			price: true,
			mechanicId: true,
			service: {
				select: {
					id: true,
					name: true,
					description: true,
					estimatedTime: true,
					price: true,
				},
			},
			mechanic: {
				select: {
					id: true,
					fullName: true,
					avatar: true,
				},
			},
		},
	},
};
