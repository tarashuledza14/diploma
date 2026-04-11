export const orderSelect = {
	id: true,
	orderNumber: true,
	status: true,
	mechanic: {
		select: {
			id: true,
			fullName: true,
		},
	},
	vehicle: {
		select: {
			brand: true,
			model: true,
			year: true,
			plateNumber: true,
		},
	},
	client: {
		select: {
			id: true,
			fullName: true,
		},
	},
	services: {
		select: {
			mechanic: {
				select: {
					id: true,
					fullName: true,
				},
			},
			service: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	},
	priority: true,
	endDate: true,
	totalAmount: true,
};
