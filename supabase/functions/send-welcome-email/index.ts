import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName } = await req.json();

    if (!email || !fullName) {
      return new Response(JSON.stringify({ error: "Missing email or fullName" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstName = fullName.split(" ")[0] || fullName;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #16a34a, #059669); padding: 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; }
    .body { padding: 30px; color: #333; line-height: 1.6; }
    .body h2 { color: #16a34a; }
    .features { margin: 20px 0; }
    .feature { padding: 8px 0; }
    .cta { margin: 25px 0; }
    .cta a { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 5px; }
    .footer { padding: 20px 30px; background: #f3f4f6; text-align: center; color: #666; font-size: 13px; }
    .contact { margin: 15px 0; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 MEGA ODDS SL</h1>
    </div>
    <div class="body">
      <p>Dear <strong>${firstName}</strong>,</p>
      <p>Welcome to <strong>MEGA ODDS SL</strong> 🎉</p>
      <p>We're excited to have you join our growing community of smart bettors who are winning daily with our expert predictions.</p>
      
      <p>At <strong>MEGA ODDS SL</strong>, we provide:</p>
      <div class="features">
        <div class="feature">✅ <strong>Free Tips</strong> to get you started</div>
        <div class="feature">💎 <strong>VIP Tips</strong> for consistent profits</div>
        <div class="feature">⭐ <strong>Special Packages</strong> for premium high-odds opportunities</div>
      </div>

      <p>Our platform is designed to give you the best experience with easy access through our app and reliable predictions you can trust.</p>

      <p><strong>📲 Get Started Now:</strong></p>
      <p>Download the app and log in to access your dashboard:</p>

      <div class="cta">
        <a href="https://mega-odds-hq.vercel.app/">🍎 iOS Web App</a>
        <a href="https://median.co/share/zpbywrk#apk">🤖 Android APK</a>
      </div>

      <p>Once logged in, you can explore our packages and start placing winning bets immediately.</p>

      <div class="contact">
        <p>If you need any assistance, feel free to reach out to us at <a href="mailto:megaoddssl@gmail.com">megaoddssl@gmail.com</a> or via WhatsApp:</p>
        <p>+23234629871 | +23277864684 | +2347070051670</p>
      </div>

      <p>Thank you for choosing <strong>MEGA ODDS SL</strong> — we're here to help you win! 💰</p>

      <p>Warm regards,<br><strong>MEGA ODDS SL Team</strong><br><em>Your Trusted Betting Tips Platform</em></p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} MEGA ODDS SL. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    // Use the LOVABLE_API_KEY to send via Lovable's email infrastructure if available
    // For now, log the welcome email attempt
    console.log(`Welcome email prepared for ${email} (${firstName})`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Welcome email prepared for ${email}`,
        html: htmlContent 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
