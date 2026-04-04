const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// استيراد المسارات (Routes)
const userRoute = require('./routes/userroute');
const materielRoute = require('./routes/materielroute');
const sectionRoute = require('./routes/sectionroute');
const stockRoute = require('./routes/stock');
const historiqueRoute = require('./routes/historiqueroute');
const exportRoute = require('./routes/export');
const validationRoute = require("./routes/validationroute");
const utilisateurRoutes = require("./routes/utilisateur");

const app = express();

// --- إعدادات Middleware ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

// --- تحسين الاتصال بـ MongoDB لبيئة Serverless ---
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;

    try {
        // تأكد من وضع MONGO_URI في إعدادات Vercel
        const db = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, 
        });
        isConnected = db.connections[0].readyState;
        console.log('✅ MongoDB connecté');
    } catch (err) {
        console.error('❌ Erreur MongoDB :', err.message);
        // في الإنتاج لا نريد توقف التطبيق بالكامل بل تسجيل الخطأ
    }
};

// Middleware للتأكد من الاتصال بقاعدة البيانات قبل معالجة أي طلب
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// --- تعريف المسارات (Routes) ---
app.use("/utilisateurs", utilisateurRoutes);
app.use('/', userRoute);
app.use('/materiel', materielRoute);
app.use('/section', sectionRoute);
app.use('/stock', stockRoute);
app.use('/historique', historiqueRoute);
app.use('/export', exportRoute);
app.use("/validation", validationRoute);

// --- التصدير لـ Vercel (هام جداً) ---
module.exports = app;

// تشغيل الخادم محلياً فقط
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));
}