const tickets = {
    classy: { name: 'Classy', price: 10000, qty: 0 },
    mvp: { name: 'MVPs', price: 100000, qty: 0 },
    executive: { name: 'Executive Table', price: 500000, qty: 0 },
    luxury: { name: 'Luxury Table', price: 1000000, qty: 0 }
};

const PAYSTACK_PUBLIC_KEY = 'pk_live_c8f7fb5048176a679328a563e5d5140627413884';

function updateQuantity(type, change) {
    tickets[type].qty = Math.max(0, tickets[type].qty + change);
    document.getElementById(`qty-${type}`).textContent = tickets[type].qty;
    updateTotal();
}

function updateTotal() {
    let total = 0;
    for (const key in tickets) {
        total += tickets[key].price * tickets[key].qty;
    }
    document.getElementById('total').textContent = '₦' + total.toLocaleString();
}

function checkout() {
    let total = 0;
    let items = [];
    
    for (const key in tickets) {
        if (tickets[key].qty > 0) {
            items.push(`${tickets[key].name} x${tickets[key].qty}`);
            total += tickets[key].price * tickets[key].qty;
        }
    }
    
    if (total === 0) {
        alert('Please select at least one ticket');
        return;
    }

    const email = prompt('Enter your email address:');
    if (!email) return;

    const reference = 'WHOISCHARLIE-' + Date.now();

    const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: total * 100,
        ref: reference,
        currency: 'NGN',
        metadata: {
            custom_fields: [
                {
                    display_name: 'Tickets',
                    variable_name: 'tickets',
                    value: items.join(', ')
                }
            ]
        },
        callback: function(response) {
            let message = `🎫 *Who is Charlie - Ticket Confirmation*\n\n`;
            message += `*Email:* ${email}\n\n`;
            message += `*Tickets:*\n`;
            
            for (const key in tickets) {
                if (tickets[key].qty > 0) {
                    const subtotal = tickets[key].price * tickets[key].qty;
                    message += `- ${tickets[key].name} x${tickets[key].qty} = ₦${subtotal.toLocaleString()}\n`;
                }
            }
            
            message += `\n*Total:* ₦${total.toLocaleString()}\n`;
            message += `*Reference:* ${response.reference}\n\n`;
            message += `Thank you for your purchase! 🎤`;
            
            const encodedMsg = encodeURIComponent(message);
            window.location.href = `https://wa.me/2347075980273?text=${encodedMsg}`;
        },
        onClose: function() {
            console.log('Payment closed');
        }
    });

    handler.openIframe();
}
