var express = require("express");
var router = express.Router();
let messageController = require('../controllers/messages');
const { CheckLogin } = require("../utils/authHandler");

// POST / : tạo message mới có type là file|text
router.post('/', CheckLogin, async function(req, res, next) {
    try {
        let currentUserId = req.user._id;
        let { to, type, text } = req.body;
        
        if (!to || !type || !text) {
            return res.status(400).send({ message: "Thiếu dữ liệu" });
        }
        if (!['file', 'text'].includes(type)) {
            return res.status(400).send({ message: "Type chỉ hợp lệ khi là file hoặc text" });
        }
        
        // Luồn lưu logic: nếu file thì text chứa path dẫn đến file, text thì chứa nội dung gửi
        let savedMessage = await messageController.createMessage(currentUserId, to, type, text);
        res.status(201).send(savedMessage);
    } catch(error) {
        res.status(500).send({ message: error.message });
    }
});

// GET / : lấy message cuối cùng của mỗi cuộc gọi user hiện tại nhắn hoặc nhận
router.get('/', CheckLogin, async function(req, res, next) {
    try {
        let currentUserId = req.user._id;
        let latestMessages = await messageController.getLatestMessagesForCurrentUser(currentUserId);
        res.status(200).send(latestMessages);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET /:userID : lấy toàn bộ message từ current user tới userID và ngược lại
router.get('/:userID', CheckLogin, async function(req, res, next) {
    try {
        let currentUserId = req.user._id;
        let targetUserId = req.params.userID;
        
        let messages = await messageController.getMessagesBetweenUsers(currentUserId, targetUserId);
        res.status(200).send(messages);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
