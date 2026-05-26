const QUESTION_BANK = {
  "zh-TW": {
    travel: [
      "你抵達當地時，迎面吹來的空氣是冷還是暖？",
      "你腳下踩著的地面，是雪、石板還是木地板？",
      "你抬頭看到的第一個風景，顏色有多鮮明？",
      "周圍人群的聲音聽起來熱鬧還是安靜？",
      "你身上的外套或衣料，碰到皮膚是什麼感覺？",
      "你手裡正拿著什麼，重量和溫度如何？",
      "當地空氣裡有沒有食物、海水或森林的味道？",
      "你停下來拍照的那一刻，臉上的表情是什麼？",
      "你望向遠方時，心裡先浮現的是安心還是興奮？",
    ],
    career: [
      "你坐在這個工作場景裡，椅背或桌面的觸感如何？",
      "你眼前的螢幕、文件或作品，呈現什麼畫面？",
      "有人對你說了什麼，讓你知道自己真的做到這一步？",
      "你此刻的節奏是沉穩、俐落，還是充滿創造力？",
      "當你完成今天的重要任務時，身體哪裡最放鬆？",
      "這個工作空間的光線，是清晨感、午後感還是夜景感？",
      "你正在和誰合作或對話？對方的語氣帶給你什麼感受？",
      "你伸手碰到工具、鍵盤或作品時，心裡有多踏實？",
      "當你意識到這是理想中的事業時，你第一個念頭是什麼？",
    ],
    wealth: [
      "當這份豐盛到來時，你第一個看見的數字或通知是什麼？",
      "你打開帳戶、信件或訊息時，手心是溫熱還是平穩的？",
      "這份金流進入生活後，你先替自己安排了什麼？",
      "你所在的空間此刻安靜嗎？還是帶著慶祝的氛圍？",
      "你身上穿的衣服、手裡拿的物品，透露出什麼從容感？",
      "你呼吸變得多慢、多穩，才發現自己真的接住了這份豐盛？",
      "此刻你最深的安全感，是來自自由、選擇，還是餘裕？",
      "當你想到未來時，身體哪個地方最先放鬆下來？",
      "你看著眼前這份成果時，臉上的表情是安定還是喜悅？",
    ],
    relationship: [
      "你們正在什麼場景相處？光線、距離和氣氛是什麼樣子？",
      "對方看著你的眼神，帶來什麼溫度或安全感？",
      "你聽見對方說話的聲音時，心裡是放鬆還是悸動？",
      "你們肩膀靠近或牽手時，皮膚感受到的觸感是什麼？",
      "這段關係裡最讓你安心的一個小動作，是什麼？",
      "你此刻笑起來的樣子，和現在有什麼不同？",
      "周圍的空氣裡，有食物、香氣或天氣的味道嗎？",
      "當你意識到自己被穩定愛著時，胸口有什麼感覺？",
      "你們共享的這一刻，更像平靜陪伴還是熱烈快樂？",
    ],
    home: [
      "你打開門走進去時，第一眼看到的是哪個角落？",
      "室內的光線落在牆面或地板上，是柔和還是明亮？",
      "你赤腳踩上地板時，觸感是溫潤、柔軟還是清爽？",
      "空間裡聞起來像木質、陽光、織品還是剛煮好的食物？",
      "你伸手碰到桌面、窗簾或沙發時，材質感是什麼？",
      "這個空間最安靜的一刻，會聽見風聲、音樂還是城市聲？",
      "你最喜歡待著的那個角落，正在做什麼事情？",
      "當你坐下來的那一秒，身體哪裡最先放鬆？",
      "你看著這個家時，心裡浮現的是滿足、安穩還是歸屬感？",
    ],
    health: [
      "你醒來的第一口呼吸，感覺輕盈還是飽滿？",
      "你身體此刻最明顯的舒服感，是來自哪個部位？",
      "你走路、伸展或抬手時，身體的節奏有多自然？",
      "周圍空氣的溫度和氣味，讓你感受到什麼平靜？",
      "你看著鏡中的自己時，臉色和眼神有什麼改變？",
      "你坐著休息時，肩膀、胸口或胃部有多放鬆？",
      "此刻的安穩，讓你更想去做哪件原本做不到的事？",
      "你聽見自己的呼吸或心跳時，節奏帶來什麼安全感？",
      "當你意識到自己真的恢復平衡時，心裡最想說什麼？",
    ],
    default: [
      "當這一刻真實發生時，你的腳踩在哪裡？地板是什麼感覺？",
      "你身邊的空氣聞起來像什麼？溫度是涼還是暖？",
      "此刻你臉上的表情是什麼樣子的？",
      "你第一眼看見的畫面裡，最吸引你的是哪個細節？",
      "你伸手觸碰到的第一樣東西，表面是柔軟還是光滑？",
      "這一刻周圍的聲音，是安靜、熱鬧，還是剛剛好？",
      "你呼吸進來的空氣，帶著什麼味道或季節感？",
      "當你知道願望已實現，肩膀和胸口有什麼變化？",
      "如果把這個片刻拍成照片，畫面裡最亮的是什麼？",
    ],
  },
  en: {
    travel: [
      "When you arrive, is the air cool or warm?",
      "What does the ground under your feet feel like?",
      "What is the first scene you notice around you?",
      "Do the voices around you sound lively or quiet?",
      "How does your jacket or clothing feel on your skin?",
      "What are you holding, and how heavy is it?",
      "Does the air carry food, sea, or forest scents?",
      "What expression appears when you stop for a photo?",
      "When you look ahead, do you feel calm or excited first?",
    ],
    career: [
      "How does the chair or desk feel in this work scene?",
      "What do you see on the screen, document, or project?",
      "What does someone say that tells you this is real now?",
      "Does your pace feel steady, sharp, or deeply creative?",
      "Which part of your body relaxes after today's key task?",
      "Does this workspace feel like morning, afternoon, or night?",
      "Who are you working with, and how does their tone feel?",
      "How grounded do you feel touching your tools or keyboard?",
      "What is your first thought when you realize this is your ideal work?",
    ],
    wealth: [
      "What number or notification do you notice first?",
      "When you open the account or message, how do your hands feel?",
      "What is the first thing you arrange with this new abundance?",
      "Does the room feel quiet, or is there a celebratory mood?",
      "What in your clothing or belongings reflects this new ease?",
      "How slow and steady does your breathing become as you receive this?",
      "Does your deepest sense of safety come from freedom or choice?",
      "Which part of your body relaxes first when you think ahead?",
      "What expression appears as you look at this result?",
    ],
    relationship: [
      "What kind of setting are you sharing together right now?",
      "What warmth do you feel in the way they look at you?",
      "Do you feel relaxed or stirred when you hear their voice?",
      "What does their touch feel like when you are close?",
      "What small gesture makes you feel safest in this bond?",
      "How does your smile look different in this moment?",
      "What scent or weather is present in the air around you?",
      "What do you feel in your chest when you realize you are loved steadily?",
      "Does this shared moment feel peaceful or joyfully alive?",
    ],
    home: [
      "What is the first corner you see when you walk in?",
      "Does the light on the walls feel soft or bright?",
      "What does the floor feel like under your bare feet?",
      "Does the space smell like wood, sunlight, fabric, or food?",
      "What texture do you feel when touching the table or sofa?",
      "In the quietest moment, what do you hear in this home?",
      "What are you doing in your favorite corner of the space?",
      "Which part of your body softens first when you sit down?",
      "When you look at this home, do you feel contentment, calm, or belonging?",
    ],
    health: [
      "How does your first breath of the day feel in your body?",
      "Where do you feel the clearest sense of comfort right now?",
      "How natural does your body feel when you walk or stretch?",
      "What in the air helps your body settle and feel calm?",
      "What change do you notice in your face or eyes?",
      "How relaxed are your shoulders, chest, or stomach right now?",
      "What does this steadiness make you want to do again?",
      "What kind of safety do you hear in your breath or heartbeat?",
      "What do you most want to say as you feel balance returning?",
    ],
    default: [
      "When this becomes real, where are your feet standing?",
      "What does the air around you smell and feel like?",
      "What expression is on your face in this moment?",
      "What detail catches your eye first in the scene?",
      "What is the texture of the first thing you touch?",
      "Does the sound around you feel quiet, lively, or balanced?",
      "What scent or season do you breathe in right now?",
      "What changes in your shoulders and chest when it arrives?",
      "If this moment were a photo, what shines brightest in it?",
    ],
  },
};

const QUESTION_CHIPS = {
  "zh-TW": {
    travel: ["空氣很清楚", "身體放鬆了", "想深呼吸", "有點不敢相信"],
    career: ["時間是自己的", "節奏很穩", "被信任了", "成果很清楚"],
    wealth: ["安心變多了", "選擇更多了", "手心很穩", "可以慢慢來"],
    relationship: ["被接住了", "心裡很暖", "很自然", "可以做自己"],
    home: ["空間很安靜", "光線剛剛好", "身體想停下", "有歸屬感"],
    health: ["呼吸變順了", "肩膀放鬆", "身體很輕", "心裡安穩"],
    default: ["畫面更清楚", "身體有感覺", "心裡變穩", "更像真的"],
  },
  en: {
    travel: ["The air is clear", "My body relaxes", "I want to breathe in", "It feels almost unreal"],
    career: ["Time feels mine", "The pace is steady", "I feel trusted", "The result is clear"],
    wealth: ["I feel safer", "I have more choice", "My hands feel steady", "I can move slowly"],
    relationship: ["I feel held", "My heart feels warm", "It feels natural", "I can be myself"],
    home: ["The space is quiet", "The light feels right", "My body wants to stay", "I feel at home"],
    health: ["Breathing feels easier", "My shoulders soften", "My body feels light", "My heart feels steady"],
    default: ["The scene is clearer", "My body feels it", "My heart steadies", "It feels more real"],
  },
};

const ACTION_PROMPTS = {
  "zh-TW": {
    travel: [
      "今天可以查一個地點、路線或價格，讓這趟旅程更有輪廓。",
      "找一張接近這個畫面的照片，先把它存進你的願景裡。",
      "寫下一個你願意準備的小東西，例如行李、預算或時間。",
    ],
    career: [
      "今天可以整理一個作品、履歷或服務說明，讓機會更容易找到你。",
      "列出一個你想合作的人或客戶類型，讓方向更清楚。",
      "做一件 10 分鐘內能完成的小事，讓工作願景往前一格。",
    ],
    wealth: [
      "今天可以看一眼收支或存款目標，讓安全感有一個真實座標。",
      "寫下一個你想讓錢支持的生活選擇，讓豐盛有具體方向。",
      "找出一個可以減少消耗的小決定，讓餘裕慢慢長出來。",
    ],
    relationship: [
      "今天可以做一個更靠近愛的小動作，例如傳訊息、說謝謝或照顧自己。",
      "寫下一個你在關係裡想感受到的具體畫面。",
      "留意今天讓你感到被理解的一個瞬間。",
    ],
    home: [
      "今天可以整理一個角落，讓理想空間先在現在的生活裡出現一點。",
      "找一張接近理想家的圖片，觀察你最被哪個細節吸引。",
      "記下一個未來空間必須擁有的感受，例如安靜、光線或香氣。",
    ],
    health: [
      "今天可以做一個讓身體更舒服的小選擇，例如喝水、伸展或早點休息。",
      "留意身體哪裡正在變好，哪怕只是很小的變化。",
      "安排一段 5 分鐘的安靜時間，讓身體知道你在聽它。",
    ],
    default: [
      "今天可以做一件很小但真實的事，讓這個願望更靠近現實。",
      "找一個能代表這個目標的畫面、文字或物品，先把它留下來。",
      "寫下一個你願意在本週完成的小步驟。",
    ],
  },
  en: {
    travel: [
      "Today, check one place, route, or price so the trip gains a clearer shape.",
      "Save one image that feels close to this scene.",
      "Write one small thing you are willing to prepare: budget, timing, or packing.",
    ],
    career: [
      "Today, refine one portfolio piece, resume line, or service description.",
      "Name one person or client type you want to work with.",
      "Do one 10-minute task that moves this work vision forward.",
    ],
    wealth: [
      "Today, look at one money number so safety has a real coordinate.",
      "Write one life choice you want abundance to support.",
      "Find one small decision that reduces unnecessary drain.",
    ],
    relationship: [
      "Today, make one small move toward love: message, thank, or care for yourself.",
      "Write one concrete relationship scene you want to feel.",
      "Notice one moment today where you feel understood.",
    ],
    home: [
      "Today, clear one corner so your future space appears a little in the present.",
      "Save one home image and notice which detail pulls you in.",
      "Write one feeling your future space must hold: quiet, light, or scent.",
    ],
    health: [
      "Today, choose one small thing that helps your body: water, stretching, or rest.",
      "Notice one place where your body is already improving.",
      "Give yourself five quiet minutes so your body knows you are listening.",
    ],
    default: [
      "Today, do one small real thing that makes this goal closer to reality.",
      "Save one image, phrase, or object that represents this goal.",
      "Write one small step you are willing to complete this week.",
    ],
  },
};

const THEME_LABELS = {
  "zh-TW": {
    travel: "旅程",
    career: "工作",
    wealth: "豐盛",
    relationship: "關係",
    home: "空間",
    health: "身體",
    default: "願望",
  },
  en: {
    travel: "Travel",
    career: "Work",
    wealth: "Abundance",
    relationship: "Relationship",
    home: "Home",
    health: "Body",
    default: "Goal",
  },
};

function getTodayKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function hashSeed(seed = "") {
  return [...String(seed)].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function sampleQuestions(questions, count = 3, seed = "") {
  const pool = [...questions];
  const picked = [];
  let cursor = hashSeed(seed);

  while (pool.length > 0 && picked.length < count) {
    const index = cursor % pool.length;
    picked.push(pool[index]);
    pool.splice(index, 1);
    cursor = Math.floor(cursor / 2) + index + 7;
  }

  return picked;
}

export function detectOrderQuestionTheme(order) {
  const text = `${order.title || ""} ${order.subtitle || ""}`.toLowerCase();

  if (/旅行|旅遊|出國|飛機|機票|滑雪|海邊|湖|露營|度假|日本|韓國|歐洲|巴黎|加拿大|旅程|trip|travel/.test(text)) {
    return "travel";
  }

  if (/家|房|住所|住處|搬家|租屋|套房|海景房|公寓|空間|裝潢|room|home|house/.test(text)) {
    return "home";
  }

  if (/工作|事業|創業|公司|職涯|職場|客戶|團隊|案子|接案|升職|升遷|自由工作|career|work|business/.test(text)) {
    return "career";
  }

  if (/愛情|關係|伴侶|婚姻|結婚|男友|女友|曖昧|相愛|relationship|love|partner/.test(text)) {
    return "relationship";
  }

  if (/金錢|財富|收入|金流|存款|豐盛|有錢|金額|money|income|wealth|abundance/.test(text)) {
    return "wealth";
  }

  if (/健康|身體|睡眠|平靜|療癒|復原|運動|冥想|wellness|health/.test(text)) {
    return "health";
  }

  return "default";
}

export function getOrderQuestions(order, locale = "zh-TW") {
  const theme = detectOrderQuestionTheme(order);
  const questionSet = QUESTION_BANK[locale] || QUESTION_BANK["zh-TW"];
  const chipSet = QUESTION_CHIPS[locale] || QUESTION_CHIPS["zh-TW"];
  const actionSet = ACTION_PROMPTS[locale] || ACTION_PROMPTS["zh-TW"];
  const labelSet = THEME_LABELS[locale] || THEME_LABELS["zh-TW"];
  const seed = `${order.id || order.title || ""}-${getTodayKey()}`;

  return sampleQuestions(questionSet[theme] || questionSet.default, 3, seed).map((question, index) => ({
    question,
    theme,
    themeLabel: labelSet[theme] || labelSet.default,
    chips: chipSet[theme] || chipSet.default,
    actionPrompt: (actionSet[theme] || actionSet.default)[index % (actionSet[theme] || actionSet.default).length],
  }));
}
