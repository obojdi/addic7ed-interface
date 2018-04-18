var
	moment = require('moment'),
	date = new Date(),
	moment = moment().locale('ru'),
	today = moment.format('L'),
	arrival=moment.subtract(10, 'days').calendar(),
	_data = {
		accountnumber: "accountnumber",
		address: "address",
		addrLine1: "Октябрьская 1",
		addrLine2: "с. Решма, Ивановская обл.",
		arrivaldate: arrival,
		bankname: "ПАО Сбербанк России",
		categories_name: "categories_name",
		check_date: today,
		check_number: 513,
		company_customer_address: "Петербург, Мойки 12",
		company_customer_doc_inn: "100500321987",
		company_customer_mfo: "company_customer_mfo",
		company_customer_name: "ООО Pepka Industries",
		company_customer_zkpo: "company_customer_zkpo",
		counter: "counter",
		date: "date",
		datein: arrival,
		dateofbirth: "dateofbirth",
		dateout: today,
		dif_amount: this.summ-this.pay_sum,
		DOC_ITN: "DOC_ITN",
		DOC_SN: "DOC_SN",
		duration: "duration",
		error: "error",
		firstname: "Константин",
		guest_email: "konst@tandex.ru",
		guests: "guests",
		// /guests: "/guests",
		lastname: "Крестовоздвиженский",
		MFO: "MFO",
		middlename: "Полиграфович",
		name: "Нагорное",
		now_date: today,
		now_date_time: "now_date_time",
		pagebreak: "pagebreak",
		passportcode: "passportcode",
		pay_sum: 10000,
		percent_discount: "15",
		phone: "+7 (910) 103-2374",
		reservation_id: "513",
		roomname: "Семейный номер",
		services_name: "services_name",
		servicesamount: "servicesamount",
		servicesamount_perunit: "servicesamount_perunit",
		summ: 14500,
		template_data: "template_data",
		// /template_data: "/template_data",
		title: "Print templates",
		total_amount_str: "Четырнадцать тысяч пятьсот рублей",
		ZKPO: "ZKPO"
	}
module.exports = _data;