require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(
cors({
origin: "*"
})
);

app.get("/", (req, res) => {
res.json({
success: true,
message: "Shop API is working"
});
});

app.post("/api/order", async (req, res) => {
try {
const order = req.body;

```
if (!order.customer || !order.customer.name) {
  return res.status(400).json({
    success: false,
    message: "Customer name required"
  });
}

const itemsText = order.items
  .map(
    (item) =>
      `• ${item.name}
```

Розмір: ${item.size}
Кількість: ${item.quantity}
Ціна: ${item.price} грн`
)
.join("\n\n");

```
const telegramMessage = `
```

🛒 НОВЕ ЗАМОВЛЕННЯ

📦 №${order.number}

👤 ПІБ:
${order.customer.name}

📞 Телефон:
${order.customer.phone}

🚚 Доставка:
${order.customer.delivery}

━━━━━━━━━━━━━━

${itemsText}

━━━━━━━━━━━━━━

💰 Сума:
${order.total} грн
`;

```
const telegramResponse = await fetch(
  `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: process.env.CHAT_ID,
      text: telegramMessage
    })
  }
);

const telegramData = await telegramResponse.json();

if (!telegramData.ok) {
  console.error("Telegram response:", telegramData);

  throw new Error(
    telegramData.description || "Telegram error"
  );
}

if (process.env.GOOGLE_SHEET_URL) {
  try {
    await fetch(process.env.GOOGLE_SHEET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(order)
    });
  } catch (sheetError) {
    console.error(
      "Google Sheets error:",
      sheetError
    );
  }
}

res.json({
  success: true
});
```

} catch (error) {
console.error(error);

```
res.status(500).json({
  success: false,
  message: error.message
});
```

}
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log(`Server started on port ${PORT}`);
});
