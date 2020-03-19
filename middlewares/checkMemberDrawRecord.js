// 需求：每个会员每天抽奖次数不能超过限制

const moment = require('moment');
const prizeRecordModel = require('../models/prizeRecord.model');

async function checkMemberDrawRecord (req, res, next) {
	try {
		const {memberId} = req.body;
		const records = await prizeRecordModel.find({memberId});
		if (records && records.length > req.activityInfo.drawLimitTotal) {
			return res.send({
				msg:'活动抽奖次数已全部用完',
				err: true,
			});
		}
		// 每天抽奖次数限制
		if (req.activityInfo.drawLimitDay) {
		  const today = moment(new Date()).format('YYYYMMDD');
		  const todays = records.filter(item => {
		    const date = moment(item.created_at).format('YYYYMMDD');
		    return date === today;
		  });
		  req.todayDrawRest = req.activityInfo.drawLimitDay - todays.length - 1;
		}
		if (!req.todayDrawRest) {
			return res.send({
				msg:'今日抽奖次数没有了，明天再来',
				err: true,
			});
		}
		req.drawRecords = records;
		next();
	}
	catch(e) {
		throw new Error(e);
	}
}

module.exports = checkMemberDrawRecord;