export function getAIResponse(query: string): string {
	const lowerQuery = query.toLowerCase();

	if (lowerQuery.includes('overdue') || lowerQuery.includes('late')) {
		return 'Based on your current data, I found **3 overdue orders**:\n\n1. **ORD-003** - Audi A4 (Robert Brown)\n   - Due: Jan 19, 2026\n   - Status: In Progress\n   - Assigned to: Mike Johnson\n\n2. **ORD-001** - BMW X5 (John Smith)\n   - Due: Jan 20, 2026\n   - Status: New\n   - Not yet started\n\nWould you like me to send reminders to the assigned mechanics?';
	}

	if (
		lowerQuery.includes('low stock') ||
		lowerQuery.includes('reorder') ||
		lowerQuery.includes('parts')
	) {
		return 'I found **3 parts that need attention**:\n\n**Out of Stock:**\n- Transmission Fluid (1L) - SKU: TF-1L\n\n**Low Stock:**\n- Air Filter - 8 units (min: 15)\n- Cabin Filter - 5 units (min: 10)\n\nShould I create a reorder request for these items?';
	}

	if (lowerQuery.includes('top') && lowerQuery.includes('client')) {
		return 'Here are your **top 5 clients by revenue** this month:\n\n1. **Robert Brown** - 4,500 (12 orders)\n2. **John Smith** - 2,450 (8 orders)\n3. **Michael Lee** - 1,800 (6 orders)\n4. **Sarah Davis** - 1,200 (5 orders)\n5. **Lisa Wang** - 980 (4 orders)\n\nRobert Brown has been flagged as a VIP client. Would you like me to suggest a loyalty reward?';
	}

	if (lowerQuery.includes('mechanic') || lowerQuery.includes('assigned')) {
		return 'Current mechanic workload:\n\n**Mike Johnson**\n- 3 active orders\n- Specialization: Engine & Transmission\n- Availability: 80%\n\n**Tom Wilson**\n- 2 active orders\n- Specialization: Brakes & Suspension\n- Availability: 60%\n\n**Sarah Davis**\n- 1 active order\n- Specialization: Electrical Systems\n- Availability: 90%\n\nSarah Davis has the most availability for new assignments.';
	}

	if (
		lowerQuery.includes('recommend') ||
		lowerQuery.includes('service') ||
		lowerQuery.includes('bmw') ||
		lowerQuery.includes('50,000')
	) {
		return 'For a **2022 BMW X5 at 50,000 km**, I recommend the following services:\n\n**Required Maintenance:**\n- Oil Change - 49.99\n- Air Filter Replacement - 34.99\n- Brake Inspection - 79.99\n\n**Recommended:**\n- Transmission Fluid Check - 29.99\n- Tire Rotation - 29.99\n- Full Vehicle Inspection - 149.99\n\n**Estimated Total:** 374.94\n\nWould you like me to create a service quote for the customer?';
	}

	if (lowerQuery.includes('history') || lowerQuery.includes('abc-1234')) {
		return '**Vehicle History for ABC-1234**\n\nVehicle: 2022 BMW X5 (Black)\nOwner: John Smith\nTotal Services: 8\n\n**Recent Services:**\n1. Jan 15, 2026 - Oil Change + Filter (94.98)\n2. Dec 10, 2025 - Tire Rotation (29.99)\n3. Nov 5, 2025 - Full Service (299.99)\n4. Sep 20, 2025 - Brake Inspection (79.99)\n\n**Next Recommended Service:** Oil change at 60,000 km\n\nWould you like to schedule the next service appointment?';
	}

	return (
		'I understand you\'re asking about: "' +
		query +
		'"\n\nI can help you with:\n- Order and service information\n- Vehicle service history\n- Inventory and parts status\n- Client analytics\n- Service recommendations\n\nCould you please provide more details or try one of the suggested quick actions?'
	);
}
