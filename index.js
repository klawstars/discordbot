require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const ALLOWED_ROLE_ID = process.env.ALLOWED_ROLE_ID;
const SELLAUTH_API_KEY = process.env.SELLAUTH_API_KEY;
const SELLAUTH_SHOP_ID = process.env.SELLAUTH_SHOP_ID;
const SELLAUTH_API_BASE = process.env.SELLAUTH_API_BASE || "https://api.sellauth.com/v1";
const CUSTOMER_ROLE_ID = "1458213066435989639";

const REQUIRED_ENV = ["BOT_TOKEN", "CLIENT_ID", "ALLOWED_ROLE_ID", "SELLAUTH_API_KEY", "SELLAUTH_SHOP_ID"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// ─── CATEGORIES & PRODUCTS ───────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "black_ops_7",
    name: "Black Ops 7",
    products: [
      { id: "BO7 - Unlocker", name: "BO7 - Unlocker" },
      { id: "BO7 - ZeroAim", name: "BO7 - ZeroAim" },
    ],
  },
  {
    id: "arc_raiders",
    name: "Arc Raiders",
    products: [
      { id: "Arc - Ancient", name: "Arc - Ancient" },
      { id: "Arc - Arcane", name: "Arc - Arcane" },
      { id: "Arc - Ignite", name: "Arc - Ignite" },

    ],
  },
  {
    id: "rainbow_six",
    name: "Rainbow Six",
    products: [
      { id: "R6 - Ancient", name: "R6 - Ancient" },
      { id: "R6 - Vega", name: "R6 - Vega" },
    ],
  },
  {
    id: "battlefield_6",
    name: "Battlefield 6",
    products: [
      { id: "BF6 - Ancient", name: "BF6 - Ancient" },
      { id: "BF6 - Ignite", name: "BF6 - Ignite" },
    ],
  },
  {
    id: "rust",
    name: "Rust",
    products: [
      { id: "Rust - Ancient", name: "Rust - Ancient" },
      { id: "Rust - Ignite", name: "Rust - Ignite" },
      { id: "Rust - Akuma", name: "Rust - Akuma" },

    ],
  },
  {
    id: "fortnite",
    name: "Fortnite",
    products: [
      { id: "FN - Ancient", name: "FN - Ancient" },
      { id: "FN - Arcane", name: "FN - Arcane" },
      { id: "FN - Ignite", name: "FN - Ignite" },

    ],
  },
  {
    id: "counter_strike_2",
    name: "Counter Strike 2",
    products: [
      { id: "CS2 - Predator", name: "CS2 - Predator" },
      { id: "CS2 - Arcane", name: "CS2 - Arcane" },
    ],
  },
  {
    id: "hwid_spoofer",
    name: "Hwid Spoofer",
    products: [
      { id: "Hwid - Perm", name: "Hwid - Perm" },
      { id: "Hwid - Temp", name: "Hwid - Temp" },
    ],
  },
];

const STATUS_OPTIONS = ["Updated", "Updating", "Down"];

const STATUS_COLORS = {
  Updated: 0x22c55e,
  Updating: 0xf59e0b,
  Down: 0xef4444,
};

const STATUS_EMOJIS = {
  Updated: "🟢",
  Updating: "🟡",
  Down: "🔴",
};

const STATUS_LABELS = {
  Updated: "Operational",
  Updating: "Under Maintenance",
  Down: "Service Disruption",
};

const STATUS_DESCRIPTIONS = {
  Updated: "This product is fully operational and available.",
  Updating: "This product is currently undergoing maintenance. Availability may be limited.",
  Down: "This product is currently unavailable. Our team is working on a fix.",
};

const DATA_DIR = path.join(__dirname, "data");
const STATUS_FILE = path.join(DATA_DIR, "statuses.json");
const DOWNLOADS_FILE = path.join(DATA_DIR, "downloads.json");
const ANNOUNCEMENT_CHANNEL_ID = "1483595156782317679";

const EMBED_TEXT = [
  "# `💎` PRODUCT STATUS IS LIVE `💎`",
  "",
  "It's Official. **The Product Status Center Is Now Live.**  ",
  "A Cleaner Way To Stay Updated Has Arrived. Built For Accessibility. Designed For Clarity.",
  "",
  "`📢`  Your New Place To Check Product Availability",
  "",
  "`📂`  **Simple** — Browse Categories And Find Products Easily  ",
  "`⚡`  **Instant** — Check Current Status In Seconds  ",
  "`✅`  **Accurate** — Reliable Updates You Can Trust",
  "",
  "`🎮`  Select A Category • Choose A Product • View Its Current Status",
  "",
  "`✨`  Everything You Need, All In One Place — A Smooth And Professional Way To Stay Informed.",
].join("\n");

const DOWNLOADS_EMBED_TEXT = [
  "# `📥` DOWNLOAD CENTER `📥`",
  "",
  "Your Products. Your Downloads. All In One Place.",
  "Instant Access To Every File — Clean, Fast, And Always Up To Date.",
  "",
  "`🔒`  Your Exclusive Download Hub",
  "",
  "`📂`  **Organized** — Browse By Category And Find Your Product  ",
  "`⚡`  **Instant** — Get Your Download Link In Seconds  ",
  "`🔄`  **Up To Date** — Always The Latest Available Version",
  "",
  "`🎮`  Select A Category • Choose A Product • Get Your Download Link",
  "",
  "`✨`  Everything You Purchased, Always Within Reach — Fast, Simple, And Reliable.",
].join("\n");


const ROLE_EMBED_TEXT = [
  "# `🔑` CUSTOMER VERIFICATION `🔑`",
  "",
  "Prove Your Purchase. Unlock Your Access. It's That Simple.",
  "A Secure And Instant Way To Get Your Customer Role — Verified In Seconds.",
  "",
  "`🛡️`  Your Exclusive Access Gateway",
  "",
  "`📧`  **Simple** — Just Enter The Email You Used To Purchase  ",
  "`⚡`  **Instant** — Role Granted Automatically Upon Verification  ",
  "`🔒`  **Secure** — Your Information Is Never Stored Or Shared",
  "",
  "`✅`  Click The Button Below • Enter Your Email • Get Your Role",
  "",
  "`✨`  Already A Customer? Claim What's Yours — Fast, Easy, And Fully Automated.",
].join("\n");

// ─── STATUS STORE ─────────────────────────────────────────────────────────────

function ensureStatusStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let existing = {};
  if (fs.existsSync(STATUS_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8"));
    } catch {
      existing = {};
    }
  }

  const next = {};
  for (const category of CATEGORIES) {
    for (const product of category.products) {
      const current = existing[product.id];
      next[product.id] = STATUS_OPTIONS.includes(current) ? current : "Updating";
    }
  }

  const existingKeys = Object.keys(existing);
  const nextKeys = Object.keys(next);
  const sameKeyCount = existingKeys.length === nextKeys.length;
  const sameKeys =
    sameKeyCount && nextKeys.every((key) => Object.prototype.hasOwnProperty.call(existing, key));
  const sameValues = sameKeys && nextKeys.every((key) => existing[key] === next[key]);

  if (!sameValues) {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(next, null, 2), "utf-8");
  }
}

function readStatuses() {
  ensureStatusStore();
  const raw = fs.readFileSync(STATUS_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeStatuses(statuses) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(statuses, null, 2), "utf-8");
}

// ─── DOWNLOADS STORE ──────────────────────────────────────────────────────────

function ensureDownloadsStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DOWNLOADS_FILE)) {
    const initial = {};
    for (const category of CATEGORIES) {
      for (const product of category.products) {
        initial[product.id] = null;
      }
    }
    fs.writeFileSync(DOWNLOADS_FILE, JSON.stringify(initial, null, 2), "utf-8");
  }
}

function readDownloads() {
  ensureDownloadsStore();
  const raw = fs.readFileSync(DOWNLOADS_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeDownloads(downloads) {
  fs.writeFileSync(DOWNLOADS_FILE, JSON.stringify(downloads, null, 2), "utf-8");
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getCategoryById(categoryId) {
  return CATEGORIES.find((category) => category.id === categoryId);
}

function getProductById(productId) {
  for (const category of CATEGORIES) {
    const product = category.products.find((item) => item.id === productId);
    if (product) return { category, product };
  }
  return null;
}

function getProductInCategory(categoryId, productId) {
  const category = getCategoryById(categoryId);
  if (!category) return null;
  const product = category.products.find((item) => item.id === productId);
  if (!product) return null;
  return { category, product };
}

function clampText(text, max) {
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

function buildProductStatusEmbed(interaction, productData, status, options = {}) {
  const statusColor = STATUS_COLORS[status] ?? 0x6b7280;
  const statusEmoji = STATUS_EMOJIS[status] ?? "⚪";
  const statusLabel = STATUS_LABELS[status] ?? status;
  const statusDescription = STATUS_DESCRIPTIONS[status] ?? "";
  const extraText = options.extraText ? clampText(options.extraText, 1200) : "";
  const imageUrl = options.imageUrl;
  const footerText = options.footerText ?? "Last checked";

  let description = `> ${statusDescription}`;
  if (extraText) description += `\n\n${extraText}`;

  const embed = new EmbedBuilder()
    .setColor(statusColor)
    .setAuthor({
      name: "Product Status Center",
      iconURL: interaction.client.user.displayAvatarURL(),
    })
    .setTitle(`${statusEmoji}  ${productData.category.name} — ${productData.product.name}`)
    .setDescription(clampText(description, 4096))
    .addFields(
      { name: "Category", value: `\`${productData.category.name}\``, inline: true },
      { name: "Product", value: `\`${productData.product.name}\``, inline: true },
      { name: "Status", value: `\`${statusLabel}\``, inline: true }
    )
    .setFooter({ text: footerText })
    .setTimestamp();

  if (imageUrl) embed.setImage(imageUrl);

  return embed;
}

function buildDownloadEmbed(interaction, productData, downloadUrl) {
  const hasLink = !!downloadUrl;

  const embed = new EmbedBuilder()
    .setColor(hasLink ? 0x6366f1 : 0x6b7280)
    .setAuthor({
      name: "Download Center",
      iconURL: interaction.client.user.displayAvatarURL(),
    })
    .setTitle(`📥  ${productData.category.name} — ${productData.product.name}`)
    .setDescription(
      hasLink
        ? `> Your download is ready. Click the link below to get the latest version.\n\n🔗 **[Download ${productData.product.name}](${downloadUrl})**`
        : "> No download link is available for this product yet. Please contact staff for assistance."
    )
    .addFields(
      { name: "Category", value: `\`${productData.category.name}\``, inline: true },
      { name: "Product", value: `\`${productData.product.name}\``, inline: true },
      { name: "Available", value: hasLink ? "`Yes`" : "`Not yet`", inline: true }
    )
    .setFooter({ text: "Keep this link private — do not share it." })
    .setTimestamp();

  return embed;
}

function hasAllowedRole(interaction) {
  if (!interaction.inGuild()) return false;
  const member = interaction.member;
  if (!member) return false;
  const memberRoles = member.roles;
  if (Array.isArray(memberRoles)) return memberRoles.includes(ALLOWED_ROLE_ID);
  if (memberRoles?.cache) return memberRoles.cache.has(ALLOWED_ROLE_ID);
  return false;
}

function isUnknownInteractionError(error) {
  const message = String(error?.message ?? "");
  return error?.code === 10062 || message.includes("Unknown interaction");
}

function buildCategoryMenu(selectedCategoryId) {
  return new StringSelectMenuBuilder()
    .setCustomId("status_category")
    .setPlaceholder("Choose a category")
    .addOptions(
      CATEGORIES.map((category) => ({
        label: category.name,
        value: category.id,
        default: category.id === selectedCategoryId,
      }))
    );
}

function buildProductMenu(categoryId) {
  const category = getCategoryById(categoryId);
  if (!category) return null;

  return new StringSelectMenuBuilder()
    .setCustomId("status_product")
    .setPlaceholder(`Products in ${category.name}`)
    .addOptions(
      category.products.map((product) => ({
        label: product.name,
        value: `${category.id}:${product.id}`,
        description: `View the status of ${product.name}`,
      }))
    );
}

function buildDownloadCategoryMenu(selectedCategoryId) {
  return new StringSelectMenuBuilder()
    .setCustomId("dl_category")
    .setPlaceholder("Choose a category")
    .addOptions(
      CATEGORIES.map((category) => ({
        label: category.name,
        value: category.id,
        default: category.id === selectedCategoryId,
      }))
    );
}

function buildDownloadProductMenu(categoryId) {
  const category = getCategoryById(categoryId);
  if (!category) return null;

  return new StringSelectMenuBuilder()
    .setCustomId("dl_product")
    .setPlaceholder(`Products in ${category.name}`)
    .addOptions(
      category.products.map((product) => ({
        label: product.name,
        value: `${category.id}:${product.id}`,
        description: `Download ${product.name}`,
      }))
    );
}


// ─── SELLAUTH HELPERS ────────────────────────────────────────────────────────

function getSellAuthHeaders() {
  return {
    Authorization: `Bearer ${SELLAUTH_API_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "HollowBot/1.0",
  };
}

async function checkSellAuthOrder(email) {
  const normalizedEmail = email.trim().toLowerCase();

  // First pass: look for at least one completed invoice for this email.
  const invoicesUrl = new URL(`${SELLAUTH_API_BASE}/shops/${SELLAUTH_SHOP_ID}/invoices`);
  invoicesUrl.searchParams.set("page", "1");
  invoicesUrl.searchParams.set("perPage", "10");
  invoicesUrl.searchParams.set("email", normalizedEmail);
  invoicesUrl.searchParams.append("statuses[]", "completed");
  invoicesUrl.searchParams.set("orderColumn", "completed_at");
  invoicesUrl.searchParams.set("orderDirection", "desc");

  const invoicesRes = await fetch(invoicesUrl, { headers: getSellAuthHeaders() });
  if (!invoicesRes.ok) {
    const text = await invoicesRes.text();
    throw new Error(`SellAuth invoices API error ${invoicesRes.status}: ${text}`);
  }

  const invoicesData = await invoicesRes.json();
  const invoices = Array.isArray(invoicesData?.data) ? invoicesData.data : [];
  const hasCompletedInvoice = invoices.some((invoice) => {
    const status = String(invoice?.status ?? "").toLowerCase();
    const invoiceEmail = String(invoice?.email ?? "").toLowerCase();
    return status === "completed" && invoiceEmail === normalizedEmail;
  });

  if (hasCompletedInvoice) {
    return true;
  }

  // Fallback: check customers summary for completed purchases.
  const customersUrl = new URL(`${SELLAUTH_API_BASE}/shops/${SELLAUTH_SHOP_ID}/customers`);
  customersUrl.searchParams.set("page", "1");
  customersUrl.searchParams.set("perPage", "10");
  customersUrl.searchParams.set("email", normalizedEmail);
  customersUrl.searchParams.set("orderColumn", "last_completed_at");
  customersUrl.searchParams.set("orderDirection", "desc");

  const customersRes = await fetch(customersUrl, { headers: getSellAuthHeaders() });
  if (!customersRes.ok) {
    const text = await customersRes.text();
    throw new Error(`SellAuth customers API error ${customersRes.status}: ${text}`);
  }

  const customersData = await customersRes.json();
  const customers = Array.isArray(customersData?.data) ? customersData.data : [];
  return customers.some((customer) => {
    const customerEmail = String(customer?.email ?? "").toLowerCase();
    const totalCompleted = Number(customer?.total_completed ?? 0);
    return customerEmail === normalizedEmail && totalCompleted > 0;
  });
}

// ─── SLASH COMMANDS ───────────────────────────────────────────────────────────

const updateProductChoices = CATEGORIES.flatMap((category) =>
  category.products.map((product) => ({
    name: `${category.name} / ${product.name}`,
    value: product.id,
  }))
);

const updateCategoryChoices = CATEGORIES.map((category) => ({
  name: category.name,
  value: category.id,
}));

const commands = [
  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Show the product status embed"),
  new SlashCommandBuilder()
    .setName("downloads")
    .setDescription("Show the download center embed"),
  new SlashCommandBuilder()
    .setName("set-download")
    .setDescription("Set or update a download link for a product")
    .addStringOption((option) =>
      option
        .setName("product")
        .setDescription("Product to update")
        .setRequired(true)
        .addChoices(...updateProductChoices)
    )
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Download URL (leave empty to remove the link)")
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("update")
    .setDescription("Update a product status")
    .addStringOption((option) =>
      option
        .setName("product")
        .setDescription("Product to update")
        .setRequired(true)
        .addChoices(...updateProductChoices)
    )
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("New status")
        .setRequired(true)
        .addChoices(...STATUS_OPTIONS.map((s) => ({ name: s, value: s })))
    ),
  new SlashCommandBuilder()
    .setName("update-product")
    .setDescription("Post a product update announcement")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("Category")
        .setRequired(true)
        .addChoices(...updateCategoryChoices)
    )
    .addStringOption((option) =>
      option
        .setName("product")
        .setDescription("Product")
        .setRequired(true)
        .addChoices(...updateProductChoices)
    )
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription("New status")
        .setRequired(true)
        .addChoices(...STATUS_OPTIONS.map((s) => ({ name: s, value: s })))
    )
    .addAttachmentOption((option) =>
      option.setName("image").setDescription("Announcement image").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("text").setDescription("Optional announcement text").setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName("role")
    .setDescription("Verify your purchase and get your customer role"),
].map((command) => command.toJSON());

async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

  if (GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log(`Slash commands registered on guild ${GUILD_ID}.`);
  } else {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("Slash commands registered globally.");
  }
}

// ─── CLIENT ───────────────────────────────────────────────────────────────────

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

// ─── INTERACTION HANDLER ──────────────────────────────────────────────────────

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // Public interactions (everyone can use posted embeds/buttons)
    const isPublicInteraction =
      (interaction.isButton() && interaction.customId === "role_verify_button") ||
      (interaction.isModalSubmit() && interaction.customId === "role_verify_modal") ||
      (interaction.isStringSelectMenu() &&
        ["status_category", "status_product", "dl_category", "dl_product"].includes(
          interaction.customId
        ));

    if (!isPublicInteraction && !hasAllowedRole(interaction)) {
      if (interaction.isRepliable()) {
        const replyPayload = { content: "You do not have permission to use this command.", ephemeral: true };
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp(replyPayload);
        } else {
          await interaction.reply(replyPayload);
        }
      }
      return;
    }

    if (interaction.isChatInputCommand()) {

      // /status
      if (interaction.commandName === "status") {
        const embed = new EmbedBuilder()
          .setColor(0x0f172a)
          .setDescription(EMBED_TEXT)
          .setFooter({ text: "Select a category, then choose a product." })
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(buildCategoryMenu());
        await interaction.reply({ embeds: [embed], components: [row] });
        return;
      }

      // /downloads
      if (interaction.commandName === "downloads") {
        const embed = new EmbedBuilder()
          .setColor(0x0f172a)
          .setDescription(DOWNLOADS_EMBED_TEXT)
          .setFooter({ text: "Select a category, then choose a product to get your link." })
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(buildDownloadCategoryMenu());
        await interaction.reply({ embeds: [embed], components: [row] });
        return;
      }

      // /set-download
      if (interaction.commandName === "set-download") {
        const productId = interaction.options.getString("product", true);
        const url = interaction.options.getString("url") ?? null;

        const productData = getProductById(productId);
        if (!productData) {
          await interaction.reply({ content: "Product not found.", ephemeral: true });
          return;
        }

        const downloads = readDownloads();
        downloads[productId] = url;
        writeDownloads(downloads);

        await interaction.reply({
          content: url
            ? `✅ Download link set for **${productData.category.name} / ${productData.product.name}**.`
            : `🗑️ Download link removed for **${productData.category.name} / ${productData.product.name}**.`,
          ephemeral: true,
        });
        return;
      }


      // /role
      if (interaction.commandName === "role") {
        const embed = new EmbedBuilder()
          .setColor(0x0f172a)
          .setDescription(ROLE_EMBED_TEXT)
          .setFooter({ text: "Click the button below to start the verification process." })
          .setTimestamp();

        const button = new ButtonBuilder()
          .setCustomId("role_verify_button")
          .setLabel("Verify My Purchase")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("🔑");

        const row = new ActionRowBuilder().addComponents(button);
        await interaction.reply({ embeds: [embed], components: [row] });
        return;
      }

      // /update
      if (interaction.commandName === "update") {
        const productId = interaction.options.getString("product", true);
        const status = interaction.options.getString("status", true);

        const productData = getProductById(productId);
        if (!productData) {
          await interaction.reply({ content: "Product not found.", ephemeral: true });
          return;
        }

        const statuses = readStatuses();
        statuses[productId] = status;
        writeStatuses(statuses);

        const statusEmoji = STATUS_EMOJIS[status] ?? "⚪";
        const statusLabel = STATUS_LABELS[status] ?? status;

        await interaction.reply({
          content: `Status updated: **${productData.category.name} / ${productData.product.name}** → ${statusEmoji} **${statusLabel}**`,
          ephemeral: true,
        });
        return;
      }

      // /update-product
      if (interaction.commandName === "update-product") {
        const categoryId = interaction.options.getString("category", true);
        const productId = interaction.options.getString("product", true);
        const status = interaction.options.getString("status", true);
        const extraText = interaction.options.getString("text");
        const image = interaction.options.getAttachment("image", true);

        const productData = getProductInCategory(categoryId, productId);
        if (!productData) {
          await interaction.reply({
            content: "The selected product does not belong to the selected category.",
            ephemeral: true,
          });
          return;
        }

        if (image.contentType && !image.contentType.startsWith("image/")) {
          await interaction.reply({ content: "The attachment must be an image file.", ephemeral: true });
          return;
        }

        const statuses = readStatuses();
        statuses[productId] = status;
        writeStatuses(statuses);

        const announcementChannel = await interaction.client.channels.fetch(ANNOUNCEMENT_CHANNEL_ID);
        if (!announcementChannel || !announcementChannel.isTextBased()) {
          await interaction.reply({
            content: `I cannot access announcement channel <#${ANNOUNCEMENT_CHANNEL_ID}>.`,
            ephemeral: true,
          });
          return;
        }

        const announcementEmbed = buildProductStatusEmbed(interaction, productData, status, {
          extraText,
          imageUrl: image.url,
          footerText: "Updated just now",
        });

        await announcementChannel.send({ embeds: [announcementEmbed] });

        const statusEmoji = STATUS_EMOJIS[status] ?? "⚪";
        const statusLabel = STATUS_LABELS[status] ?? status;

        await interaction.reply({
          content: `Announcement sent in <#${ANNOUNCEMENT_CHANNEL_ID}>: **${productData.category.name} / ${productData.product.name}** → ${statusEmoji} **${statusLabel}**`,
          ephemeral: true,
        });
        return;
      }

      return;
    }


    if (interaction.isButton()) {
      if (interaction.customId === "role_verify_button") {
        const modal = new ModalBuilder()
          .setCustomId("role_verify_modal")
          .setTitle("Purchase Verification");

        const emailInput = new TextInputBuilder()
          .setCustomId("role_email")
          .setLabel("Email used for your purchase")
          .setStyle(TextInputStyle.Short)
          .setPlaceholder("example@email.com")
          .setRequired(true)
          .setMinLength(5)
          .setMaxLength(254);

        modal.addComponents(new ActionRowBuilder().addComponents(emailInput));
        await interaction.showModal(modal);
        return;
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === "role_verify_modal") {
        const email = interaction.fields.getTextInputValue("role_email").trim().toLowerCase();

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        // Basic email format check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          await interaction.editReply({ content: "❌ Please enter a valid email address." });
          return;
        }

        let hasPurchase;
        try {
          hasPurchase = await checkSellAuthOrder(email);
        } catch (err) {
          console.error("SellAuth lookup failed:", err);
          await interaction.editReply({ content: "❌ Could not verify your purchase at this time. Please try again later or contact staff." });
          return;
        }

        if (!hasPurchase) {
          const embed = new EmbedBuilder()
            .setColor(0xef4444)
            .setTitle("❌ No Purchase Found")
            .setDescription(`No completed order was found for **${email}**.

If you believe this is an error, please contact staff directly.`)
            .setFooter({ text: "Make sure you use the exact email address from your order." })
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
          return;
        }

        // Check if already has the role
        const member = interaction.member;
        if (member.roles.cache.has(CUSTOMER_ROLE_ID)) {
          await interaction.editReply({ content: "✅ You already have the customer role." });
          return;
        }

        try {
          await member.roles.add(CUSTOMER_ROLE_ID);
        } catch (err) {
          console.error("Failed to assign role:", err);
          await interaction.editReply({ content: "❌ Could not assign the role. Please make sure the bot has the **Manage Roles** permission and that its role is above the customer role." });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor(0x22c55e)
          .setTitle("✅ Purchase Verified")
          .setDescription(`Your purchase has been verified for **${email}**.

Your customer role has been granted. Welcome!`)
          .setFooter({ text: "Thank you for your purchase." })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }
    }

    if (interaction.isStringSelectMenu()) {

      // Status — category selected
      if (interaction.customId === "status_category") {
        const selectedCategoryId = interaction.values[0];
        const productMenu = buildProductMenu(selectedCategoryId);

        if (!productMenu) {
          await interaction.reply({ content: "Category not found.", ephemeral: true });
          return;
        }

        const categoryRow = new ActionRowBuilder().addComponents(buildCategoryMenu(selectedCategoryId));
        const productRow = new ActionRowBuilder().addComponents(productMenu);
        await interaction.reply({ components: [categoryRow, productRow], ephemeral: true });
        return;
      }

      // Status — product selected
      if (interaction.customId === "status_product") {
        const [, productId] = interaction.values[0].split(":");
        const productData = getProductById(productId);

        if (!productData) {
          await interaction.reply({ content: "Product not found.", ephemeral: true });
          return;
        }

        const statuses = readStatuses();
        const currentStatus = statuses[productId] || "Updating";
        const statusEmbed = buildProductStatusEmbed(interaction, productData, currentStatus, {
          footerText: "Last checked",
        });

        await interaction.reply({ embeds: [statusEmbed], ephemeral: true });
        return;
      }

      // Downloads — category selected
      if (interaction.customId === "dl_category") {
        const selectedCategoryId = interaction.values[0];
        const productMenu = buildDownloadProductMenu(selectedCategoryId);

        if (!productMenu) {
          await interaction.reply({ content: "Category not found.", ephemeral: true });
          return;
        }

        const categoryRow = new ActionRowBuilder().addComponents(buildDownloadCategoryMenu(selectedCategoryId));
        const productRow = new ActionRowBuilder().addComponents(productMenu);
        await interaction.reply({ components: [categoryRow, productRow], ephemeral: true });
        return;
      }

      // Downloads — product selected
      if (interaction.customId === "dl_product") {
        const [, productId] = interaction.values[0].split(":");
        const productData = getProductById(productId);

        if (!productData) {
          await interaction.reply({ content: "Product not found.", ephemeral: true });
          return;
        }

        const downloads = readDownloads();
        const downloadUrl = downloads[productId] ?? null;
        const dlEmbed = buildDownloadEmbed(interaction, productData, downloadUrl);

        await interaction.reply({ embeds: [dlEmbed], ephemeral: true });
        return;
      }
    }
  } catch (error) {
    if (isUnknownInteractionError(error)) {
      console.warn(
        "Interaction expired or already handled (10062). If this keeps happening, ensure only one bot instance is running."
      );
      return;
    }

    console.error(error);

    if (interaction.isRepliable()) {
      const errorPayload = { content: "An error occurred. Please try again.", ephemeral: true };
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp(errorPayload).catch(() => {});
      } else {
        await interaction.reply(errorPayload).catch(() => {});
      }
    }
  }
});

// ─── BOOT ─────────────────────────────────────────────────────────────────────

(async () => {
  await registerCommands();
  await client.login(BOT_TOKEN);
})();
