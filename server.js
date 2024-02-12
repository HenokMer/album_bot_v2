const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Get bot token and admin chat ID from environment variables
const botToken = process.env.BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID;

// Create a bot instance
const bot = new TelegramBot(botToken, { polling: true });

// store the user's chat ID when they submit the receipt
let userChatId;

// Define the start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Hi ${msg.from.first_name}! እንኳን ደህና መጡ!\nWelcome to the Album Bot. How can I assist you today?`, {
        reply_markup: {
            keyboard: [['Info📝', 'Help🆘'], ['Buy Albums💰']],
            resize_keyboard: true,
        },
    });
});

// Define the Info command
bot.onText(/Info📝/, (msg) => {
    const chatId = msg.chat.id;
    const botInfo = `Album Bot\n\nThis bot allows you to buy albums and get information about the albums available.`;
    bot.sendMessage(chatId, botInfo);
});

// Define the Help command
bot.onText(/Help🆘/, (msg) => {
    const chatId = msg.chat.id;
    const availableCommands = `Available commands:\n/start - Start a new conversation\nHelp - Display available commands\nBuy Albums - Buy albums\n Contact: @itshenok1 for more info`;
    bot.sendMessage(chatId, availableCommands);
});

// Define the Buy Albums command
bot.onText(/Buy Albums💰/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to the Buy Albums section.\n የክፍያ መንገድ ይምረጡ\n Please choose an option:', {
        reply_markup: {
            keyboard: [['Get Account Number💳'], ['Submit Receipt📃'], ['Main Menu⬅️']],
            resize_keyboard: true,
        },
    });
});


// Main Menu button
bot.onText(/Main Menu⬅️/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Hi ${msg.from.first_name}! እንኳን ደህና  መጡ\nWelcome to the Album Bot. How can I assist you today?`, {
        reply_markup: {
            keyboard: [['Info📝', 'Help🆘'], ['Buy Albums💰']],
            resize_keyboard: true,
        },
    });
});
// Handle the "Get Account Number" option
bot.onText(/Get Account Number💳/, (msg) => {
    const chatId = msg.chat.id;

    const album_info = `ከታች በተዘረዘሩት የሂሳብ ቁጥሮች 100 ብር እና ከዛም በላይ በማስገባት አገልግሎቱን በመደገፍ 
    \n"የህይወት መና" የተሰኘውን የዘማሪት ባንቺአየሁ ሞገስን ቁ.1 ሙሉ አልበም ማግኘት ይችላሉ!
    ገቢ ካደረጉ በኋላ Screenshot ወይም ፎቶ ይላኩ\n\n⚠ የሂሳብ ቁጥሩን በመንካት Copy ማድረግ ይችላሉ። \n\n⚠ ገቢ ካደረጉ በኋላ /Submit_Reciept የሚለውን ቁልፍ በመጫን ፎቶ ይላኩ።\n` 

    const bankAccounts = {
        '1000519452441': 'ንግድ ባንክ ☝️',
        '5107857794011': 'ዳሸን ባንክ ☝️',
        '9900017304309': 'አማራ ባንክ ☝️',
        '01349822310601': 'አዋሽ ባንክ ☝️'
        // Add more banks and account numbers as needed [dont forget to add commas if youo add banks]
    };
    let accountInfo = '\nየሂሳብ ቁጥሮች:\n\n';
    for (const [bank, account] of Object.entries(bankAccounts)) {
        accountInfo += `<code>${bank}:</code> <pre>${account}</pre>\n`;
    }
    bot.sendMessage(chatId, album_info + accountInfo + '\nጌታ ዘመናችሁን ይባርክ!', { parse_mode: 'HTML' });
});

// Handle the "Submit Receipt" option
bot.onText(/Submit Receipt📃/, (msg) => {
    const chatId = msg.chat.id;
    userChatId = chatId; // Store the user's chat ID
    bot.sendMessage(chatId, 'እባኮ ፎቶውን ይላኩ\nPlease upload a picture of your receipt. \n⚠Make sure it\'s clear and readable.');
});

// Handle incoming photos (receipt submission)
bot.on('photo', (msg) => {
    const chatId = msg.chat.id;
    const fileId = msg.photo[0].file_id;
    bot.sendMessage(chatId, `Please wait for admin's response...(ጥያቄዎ በመስተናገድ ላይ ነው እባኮ ጥቂት ይጠብቁ...)`);
    bot.sendPhoto(adminChatId, fileId, {
        caption: `📬 New Request recieved 
        \n#Request_Buy_Full_Album
        \n📝 Request title: Buy የህይወት መና Full Album
        \n📅 Request date: ${Date.now()}
        \n📎 Request information
        \n〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰
        \n📌  Name: ${msg.from.first_name}
        \n📌 <code> Chat ID:</code> <pre>${msg.from.id}</pre>
        \n〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️
        \n🚧 End request information`,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Accept', callback_data: 'accept' },
                    { text: 'Decline', callback_data: 'decline' },
                ],
            ],
        },
    });
});



const verified_message = `
🎖 Dear Customer
\nጥያቄዎ በትክክል ተስተናግዷል!
\nThe payment has been confirmed successfully
\n📆Your membership is valid until  30/12/2043 
\nClick the below link to enter the channel👇🏽\n`

bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    if (data === 'accept') {
        // Store the user's chat ID
        userChatId = chatId;
        bot.sendMessage(adminChatId, 'Please provide chat id and invite link for the user.');

    } else if (data === 'decline') {
        bot.sendMessage(userChatId, 'Sorry, your payment was not successful. Please try again or contact support.');

        // bot.deleteMessage(chatId, messageId);
    }
});

// // Handle messages from the admin
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;
    console.log(chatId, adminChatId);
    
    try{
        if (Number(chatId) === Number(adminChatId)) {
            const message = messageText.split(" ");
            const uid = message[0];
    
            console.log(uid);
    
            bot.sendMessage(uid, verified_message + message[1]);
            bot.sendMessage
        }else{
            console.log('admin privilage is required to send message!');
        }
    }catch(err){
        bot.sendMessage(adminChatId, 'Please make sure user id and invite link is separeted by space.')
    }

});

// Handle errors
bot.on('polling_error', (error) => {
    console.error(error);
});
