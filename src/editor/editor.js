function lineNumbersFunc(num) {
	var roman =  {"\ua666":1000000, "\ua4f2\ua666": 900000, "\ua4f7":500000, "\ua4f2\ua4f7": 400000, "\ua4db": 100000, "\ua4f2\ua4db": 90000, "\ua4f6":50000, "\ua4f2\ua4f6": 40000, "\ua4eb":10000, "\ua4f2\ua4eb": 9000, "\ua4e5":5000, "\ua4f2\ua4e5": 4000, "M" :1000, "CM":900, "D":500, "CD":400, "C":100, "XC":90, "L":50, "XL":40, "X":10, "IX":9, "V":5, "IV":4, "I":1};
	var str = "";

	// for (var i of Object.keys(roman) ) {
	// 	var q = Math.floor(num / roman[i]);
	// 	num -= q * roman[i];
	// 	str += i.repeat(q);
	// }

	return "" + num;
}

module.exports = lineNumbersFunc;
