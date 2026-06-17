/* ============================================
   塔罗心灵驿站 - 应用逻辑
   ============================================ */

// ========== 全局状态 ==========
const AppState = {
    currentSection: 'home',
    currentSpread: 'daily',
    deck: [],
    drawnCards: [],
    isDrawing: false,
    hasDrawn: false
};

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSpreadSelector();
    initDeck();
    initMobileMenu();
    initProfileSection();  // 初始化个人情况说明
    initScrollEffect();   // 初始化导航栏滚动效果
});

// ========== 导航系统 ==========
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            navigateTo(targetId);
        });
    });
}

function navigateTo(sectionId, spreadType) {
    // 更新导航状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
    });

    // 切换页面
    document.querySelectorAll('.section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });

    AppState.currentSection = sectionId;
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 如果指定了牌阵类型
    if (spreadType && sectionId === 'draw') {
        selectSpread(spreadType);
    }

    // 关闭移动端菜单
    document.querySelector('.nav-links').classList.remove('active');
}

// ========== 导航栏滚动效果 ==========
function initScrollEffect() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let lastScroll = 0;
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        lastScroll = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (lastScroll > 50) {
                    navbar.classList.add('scrolled');
                    document.body.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                    document.body.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ========== 移动端菜单 ==========
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

// ========== 个人情况说明管理 ==========
const UserProfile = {
    data: {},
    selectedMood: null,
    selectedConcerns: []
};

function initProfileSection() {
    // 初始化情绪选择器
    initMoodSelector();
    // 初始化关注领域选择器
    initConcernSelector();
    // 尝试从本地存储恢复
    loadProfileFromStorage();
}

/**
 * 切换个人情况面板展开/收起
 */
function toggleProfile() {
    const body = document.getElementById('profileBody');
    const toggle = document.getElementById('profileToggle');
    
    if (body && toggle) {
        body.classList.toggle('open');
        toggle.classList.toggle('open');
    }
}

/**
 * 初始化情绪选择器（单选）
 */
function initMoodSelector() {
    const selector = document.getElementById('moodSelector');
    if (!selector) return;
    
    selector.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // 移除其他active状态
            selector.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            UserProfile.selectedMood = btn.dataset.mood;
        });
    });
}

/**
 * 初始化关注领域选择器（多选）
 */
function initConcernSelector() {
    const selector = document.getElementById('concernSelector');
    if (!selector) return;
    
    selector.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            updateSelectedConcerns();
        });
    });
}

function updateSelectedConcerns() {
    const activeTags = document.querySelectorAll('#concernSelector .tag-btn.active');
    UserProfile.selectedConcerns = Array.from(activeTags).map(tag => tag.dataset.concern);
}

/**
 * 保存个人情况
 */
function saveProfile() {
    // 收集所有表单数据
    UserProfile.data = {
        nickname: document.getElementById('userNickname')?.value?.trim() || '',
        birthday: document.getElementById('userBirthday')?.value || '',
        gender: document.getElementById('userGender')?.value || '',
        zodiac: document.getElementById('userZodiac')?.value || '',
        occupation: document.getElementById('userOccupation')?.value?.trim() || '',
        lifeStage: document.getElementById('userLifeStage')?.value || '',
        mood: UserProfile.selectedMood,
        concerns: [...UserProfile.selectedConcerns],
        description: document.getElementById('userDescription')?.value?.trim() || ''
    };

    // 保存到 localStorage
    try {
        localStorage.setItem('tarot_user_profile', JSON.stringify(UserProfile.data));
    } catch (e) {
        console.warn('无法保存到本地存储:', e);
    }

    // 更新UI反馈
    const badge = document.getElementById('profileBadge');
    const hint = document.getElementById('profileSavedHint');
    
    // 检查是否有实质内容
    const hasContent = Object.values(UserProfile.data).some(v => 
        v !== '' && v !== null && v !== undefined && 
        !(Array.isArray(v) && v.length === 0)
    );

    if (badge) {
        badge.textContent = hasContent ? '已填写' : '选填';
        badge.className = hasContent ? 'profile-badge filled' : 'profile-badge';
    }
    
    if (hint) {
        hint.style.display = 'inline';
        setTimeout(() => { hint.style.display = 'none'; }, 3000);
    }
}

/**
 * 从本地存储恢复个人情况
 */
function loadProfileFromStorage() {
    try {
        const saved = localStorage.getItem('tarot_user_profile');
        if (saved) {
            UserProfile.data = JSON.parse(saved);
            
            // 恢复表单字段
            if (UserProfile.data.nickname) safeSetValue('userNickname', UserProfile.data.nickname);
            if (UserProfile.data.birthday) safeSetValue('userBirthday', UserProfile.data.birthday);
            if (UserProfile.data.gender) safeSetValue('userGender', UserProfile.data.gender);
            if (UserProfile.data.zodiac) safeSetValue('userZodiac', UserProfile.data.zodiac);
            if (UserProfile.data.occupation) safeSetValue('userOccupation', UserProfile.data.occupation);
            if (UserProfile.data.lifeStage) safeSetValue('userLifeStage', UserProfile.data.lifeStage);
            if (UserProfile.data.description) safeSetValue('userDescription', UserProfile.data.description);

            // 恢复情绪选择
            if (UserProfile.data.mood) {
                UserProfile.selectedMood = UserProfile.data.mood;
                const moodBtn = document.querySelector(`.mood-btn[data-mood="${UserProfile.data.mood}"]`);
                if (moodBtn) moodBtn.classList.add('active');
            }

            // 恢复关注领域
            if (Array.isArray(UserProfile.data.concerns)) {
                UserProfile.selectedConcerns = [...UserProfile.data.concerns];
                UserProfile.data.concerns.forEach(concern => {
                    const tagBtn = document.querySelector(`.tag-btn[data-concern="${concern}"]`);
                    if (tagBtn) tagBtn.classList.add('active');
                });
            }

            // 更新徽章状态
            const badge = document.getElementById('profileBadge');
            if (badge) {
                badge.textContent = '已填写';
                badge.className = 'profile-badge filled';
            }
        }
    } catch (e) {
        console.warn('无法读取本地存储:', e);
    }
}

function safeSetValue(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) el.value = value;
}

/**
 * 获取用户画像摘要文本（用于解读时参考）
 */
function getProfileContext() {
    const d = UserProfile.data;
    if (!d || Object.keys(d).length === 0) return '';

    let context = '';
    const parts = [];

    if (d.nickname) parts.push(`${d.nickname}`);
    if (d.gender === 'female') parts.push('女性');
    else if (d.gender === 'male') parts.push('男性');

    if (d.occupation) parts.push(`当前为${d.occupation}`);

    const stageMap = {
        student: '求学阶段',
        early_career: '职场新人',
        career_growth: '事业发展期',
        midlife_transition: '人生转型探索期',
        established: '稳定成熟期',
        retirement: '退休/半退休期'
    };
    if (d.lifeStage && stageMap[d.lifeStage]) parts.push(`处于${stageMap[d.lifeStage]}`);

    const moodMap = {
        anxious: '近期感到焦虑不安',
        confused: '目前有些迷茫困惑',
        sad: '最近情绪低落',
        neutral: '情绪较为平静',
        hopeful: '对未来充满期待',
        excited: '心情比较兴奋激动'
    };
    if (d.mood && moodMap[d.mood]) parts.push(moodMap[d.mood]);

    const concernMap = {
        career: '事业工作',
        love: '感情婚姻',
        family: '家庭关系',
        wealth: '财运金钱',
        health: '健康身心',
        study: '学业考试',
        self_growth: '个人成长',
        decision: '重要抉择'
    };
    if (d.concerns && d.concerns.length > 0) {
        const concerns = d.concerns.map(c => concernMap[c] || c).join('、');
        parts.push(`关注${concerns}方面的问题`);
    }

    if (d.description) parts.push(`特别说明：${d.description}`);

    if (parts.length > 0) {
        context = parts.join('，') + '。';
    }

    return context;
}

// ========== 牌阵选择器 ==========
function initSpreadSelector() {
    const options = document.querySelectorAll('.spread-option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            selectSpread(option.dataset.spread);
        });
    });
}

function selectSpread(spreadType) {
    AppState.currentSpread = spreadType;
    
    // 更新UI
    document.querySelectorAll('.spread-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.spread === spreadType);
    });

    // 重置抽卡状态
    resetDraw();
}

// ========== 卡牌堆初始化 ==========
function initDeck() {
    renderDeck();
    
    const deckEl = document.getElementById('tarotDeck');
    if (deckEl) {
        deckEl.addEventListener('click', () => {
            if (!AppState.hasDrawn) {
                shuffleAndPrepare();
            }
        });
    }
}

function renderDeck() {
    const deckEl = document.getElementById('tarotDeck');
    if (!deckEl) return;

    // 创建5张层叠卡牌视觉效果
    let html = '';
    for (let i = 0; i < 5; i++) {
        html += `<div class="deck-card">🎴</div>`;
    }
    deckEl.innerHTML = html;
}

// ========== 洗牌与准备 ==========
function shuffleAndPrepare() {
    const deckEl = document.getElementById('tarotDeck');
    const drawBtn = document.getElementById('drawBtn');
    const hint = document.querySelector('.deck-hint');

    // 添加洗牌动画
    deckEl.classList.add('shuffling');
    
    // 洗牌
    AppState.deck = shuffleDeck(getAllCards());
    AppState.drawnCards = [];
    AppState.isDrawing = true;

    // 动画结束后更新状态
    setTimeout(() => {
        deckEl.classList.remove('shuffling');
        
        // 更新提示文字
        if (hint) hint.textContent = '牌已洗好，点击下方按钮抽牌';
        
        // 启用抽牌按钮
        if (drawBtn) {
            drawBtn.disabled = false;
            drawBtn.textContent = '抽牌';
        }

        // 清空已抽出的牌区域
        document.getElementById('drawnCards').innerHTML = '';
    }, 800);
}

// ========== 抽牌逻辑 ==========
function drawCard() {
    const spreadConfig = SPREADS[AppState.currentSpread];
    const cardsNeeded = spreadConfig.cardCount;
    const alreadyDrawn = AppState.drawnCards.length;

    if (alreadyDrawn >= cardsNeeded) return;

    // 从牌堆中抽取一张
    const card = AppState.deck.pop();
    if (!card) return;

    AppState.drawnCards.push(card);

    // 渲染抽出的牌
    renderDrawnCard(card, alreadyDrawn, spreadConfig.positions[alreadyDrawn]);

    // 检查是否抽完
    if (AppState.drawnCards.length >= cardsNeeded) {
        AppState.hasDrawn = true;
        AppState.isDrawing = false;
        
        const drawBtn = document.getElementById('drawBtn');
        const interpretBtn = document.getElementById('interpretBtn');
        const hint = document.querySelector('.deck-hint');

        if (drawBtn) drawBtn.style.display = 'none';
        if (interpretBtn) interpretBtn.style.display = 'inline-flex';
        if (hint) hint.textContent = `已抽出 ${cardsNeeded} 张牌`;
    } else {
        const drawBtn = document.getElementById('drawBtn');
        if (drawBtn) {
            drawBtn.textContent = `再抽一张 (${AppState.drawnCards.length}/${cardsNeeded})`;
        }
    }
}

function renderDrawnCard(card, index, position) {
    const container = document.getElementById('drawnCards');
    
    const cardEl = document.createElement('div');
    cardEl.className = 'drawn-card';
    cardEl.style.animationDelay = `${index * 0.15}s`;
    cardEl.onclick = () => showCardDetail(card);
    
    cardEl.innerHTML = `
        <div class="card-face">
            <div class="card-symbol">${card.symbol}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-position">${position}</div>
        </div>
    `;
    
    container.appendChild(cardEl);
}

// ========== 重置抽卡 ==========
function resetDraw() {
    AppState.deck = [];
    AppState.drawnCards = [];
    AppState.isDrawing = false;
    AppState.hasDrawn = false;

    // 重置UI
    const drawnCardsEl = document.getElementById('drawnCards');
    const drawBtn = document.getElementById('drawBtn');
    const interpretBtn = document.getElementById('interpretBtn');
    const hint = document.querySelector('.deck-hint');

    if (drawnCardsEl) drawnCardsEl.innerHTML = '';
    if (drawBtn) {
        drawBtn.disabled = true;
        drawBtn.style.display = 'inline-flex';
        drawBtn.textContent = '抽牌';
    }
    if (interpretBtn) interpretBtn.style.display = 'none';
    if (hint) hint.textContent = '点击卡牌堆开始抽牌';

    // 重新渲染牌堆
    renderDeck();
    initDeck(); // 重新绑定事件
}

// ========== 显示解读 ==========
function showInterpretation() {
    navigateTo('reading');
    renderReading();
}

function renderReading() {
    const container = document.getElementById('readingContent');
    if (!container) return;

    const spreadConfig = SPREADS[AppState.currentSpread];
    const question = document.getElementById('questionInput')?.value?.trim();

    let html = `
        <div class="reading-header">
            <h3>${spreadConfig.name} · 牌面解读</h3>
            <p>${question ? `📝 你的问题：「${question}」` : '✨ 让塔罗牌为你揭示答案'}</p>
        </div>

        <div class="reading-cards-display">
    `;

    // 显示所有抽出的牌
    AppState.drawnCards.forEach((card, index) => {
        html += `
            <div class="reading-card-item">
                <div class="rcard-icon">${card.symbol}</div>
                <div class="rcard-name">${card.name}</div>
                <div class="rcard-pos">${spreadConfig.positions[index]}</div>
            </div>
        `;
    });

    html += '</div>';

    // 综合解读
    html += generateCompositeReading(spreadConfig, question);

    container.innerHTML = html;
}

// ========== 解读引擎 v2 - 动态差异化系统 ==========

let _readingSessionId = null;

const READING_VARIANTS = {
    openings: [
        (cards, q) => `当你抽出这些牌的瞬间，宇宙正在用一种独特的方式与你对话${q ? `——关于「${q}」` : ''}。牌面的排列并非偶然，而是你潜意识深处某种渴望的外在投射。`,
        (cards, q) => `${q ? `关于「${q}」，` : ''}这组牌面呈现出一种微妙的能量共振。每一张牌都像是一个独立的讯息片段，而当它们组合在一起时，一个更完整的故事开始浮现。`,
        (cards, q) => `深呼吸——让这些牌面的意象慢慢渗透进你的意识。${q ? `你带着关于「${q}」的疑问来到这里，` : ''}而塔罗牌将以它独有的方式为你展开答案的画卷。`,
        (cards, q) => `牌已落定，命运的齿轮悄然转动。${q ? `关于「${q}」的问题，` : ''}这组牌面将揭示一些你可能已经隐约感觉到、但尚未完全看清的东西。`,
        (cards, q) => `在这个特别的时刻，你与这组塔罗牌产生了连接。${q ? `让它们来回应你对「${q}」的探寻。` : '让它们为你照亮前行的道路。'}`,
    ],
    energySummaries: [
        (kw, hm, sf) => `纵观整个牌阵，核心能量汇聚于<strong>${kw.join(' · ')}</strong>。${hm ? '大阿尔卡纳的介入说明这件事触及了你生命的底层架构，不是表面的波动。' : ''}${sf ? `从元素层面看，${sf}是当前最活跃的能量场。` : ''}`,
        (kw, hm, sf) => `这组牌面编织出的主题图谱以<strong>${kw.join(' · ')}</strong>为经纬。${hm ? '大阿卡纳牌的出现意味着这不是一个普通的周期——命运之手正在参与其中。' : ''}${sf ? `特别值得关注的是${sf}层面的强烈信号。` : ''}`,
        (kw, hm, sf) => `<strong>${kw.join(' · ')}</strong>——这是本次牌阵想要传达的核心频率。${hm ? '大阿尔卡纳的存在提醒我们：眼前的议题比你想象的更有深度。' : ''}${sf ? `而在具体的生活领域中，${sf}是最需要你投入注意力的方向。` : ''}`,
    ],
    closings: [
        (pf) => `最后想对你说：塔罗牌是一面镜子，它映照出的始终是你自己。${pf ? `结合你的个人情况来看，` : ''}真正的答案不在牌上，而在你心里。相信自己的判断力，同时保持开放的心态面对可能性。`,
        (pf) => `记住，牌面展示的是一种可能性的图景，而非不可改变的预言。${pf ? `考虑到你目前的处境，` : ''}你有能力去塑造接下来发生的事情。塔罗给你的最大礼物，是让你看见自己拥有的选择权。`,
        (pf) => `愿这次的解读能为你带来一些新的视角。${pf ? `在你当前的人生阶段，` : ''}最重要的不是预知未来，而是理解当下。当你真正理解了此刻，未来自然会清晰地展开。`,
        (pf) => `牌局已尽，但生活的篇章还在继续书写。${pf ? `结合你的情况，` : ''}建议你在接下来的几天里留意那些看似巧合的事件——它们往往是宇宙对你最直接的低语。`,
        (pf) => `感谢你愿意通过塔罗牌来探索自己。${pf ? `针对你的个人情况，` : ''}这次解读的核心讯息其实可以归结为一句话：你已经拥有了你所需要的一切，只是有时候需要一点帮助才能看见它。`,
    ]
};

const CARD_INTERACTIONS = {
    majorCombos: {
        'The Fool+The Magician': '愚者遇见魔术师——纯真的冒险精神即将转化为具体的行动力。这是一个从"想做"到"在做"的关键转折点。',
        'The Lovers+The Chariot': '恋人牌的选择加上战车牌的意志力——一旦做出了决定，就用全部的力量去执行它。犹豫不决的时候最消耗能量。',
        'The Tower+The Star': '高塔之后必有星星。毁灭性的事件往往是为重建腾出空间的前奏。如果你刚刚经历了一些崩塌，请相信——最好的还在后面。',
        'Death+The Sun': '死神与太阳同现，这是最积极的转化信号之一。旧的结束正是新生的开始，而且这个新生会带来纯粹的喜悦。',
        'The Hermit+The World': '隐士的独处最终通向世界的圆满。你现在经历的孤独和内省，是在为一个更大的完整做准备。',
        'The Devil+The Temperance': '魔鬼代表执念与束缚，节制代表平衡与调和。这组牌在说：你被某些东西困住了，但解药就在适度与平衡之中。',
        'The Moon+The Sun': '月亮与太阳同现——从迷茫走向清晰的过程正在发生。黑暗中孕育的光明即将破晓。',
        'Justice+The Wheel of Fortune': '正义与命运之轮的组合暗示着因果循环——过去的每一个选择都在塑造着当下的局面，而现在的决定又将影响未来的轨迹。',
    },
    elementDynamics: {
        'wands+cups': '火（权杖）与水（圣杯）的相遇总是充满张力——行动的热情与情感的深度在这里交汇，需要找到两者共存的方式。',
        'swords+pentacles': '宝剑的思维分析遇上钱币的现实考量，这是一个非常务实的组合。理想很丰满，但你需要脚踏实地去实现它。',
        'wands+swords': '双重的风元素——权杖的行动力加上宝剑的清晰思维。思路清晰时就是最佳的行动时机，但也要避免过于理性而忽略了感受。',
        'cups+pentacles': '圣杯的情感需求与钱币的物质现实之间需要找到平衡点。既要照顾内心，也不能忽视实际生活。',
        'wands+pentacles': '权杖的创造力与钱币的稳定性结合——这是将想法落地的绝佳配置！有愿景也有执行力。',
    },
    numberPatterns: {
        lowNumbers: '低数字牌（1-5）为主的牌阵暗示事情还处于起步或发展阶段，不要急于求成，给过程一些时间。',
        midNumbers: '中段数字牌（6-9）的出现表明事物正在走向成熟，你已经度过了最初的困难期，现在进入了一个相对稳定的阶段。',
        highNumbers: '高位数字牌（10+）密集出现预示着一个周期的收尾或重大转折。旧的阶段即将结束，新的篇章正在酝酿。',
        ascending: '牌面数字呈现上升趋势——这是一个积极的发展信号，能量正在向上流动，事情会越来越好。',
        descending: '数字逐渐降低——可能表示需要回归基础，或者某个事物正在经历收缩和简化的过程。',
    }
};

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function seededRandom(seed) { const x = Math.sin(seed * 9999) * 10000; return x - Math.floor(x); }
function createReadingSession() { _readingSessionId = Date.now() + Math.random(); }

function analyzeNumberPattern(cards) {
    const nums = cards.filter(c => c.number !== undefined && c.number !== 0).map(c => c.number);
    if (!nums.length) return null;
    const avg = nums.reduce((a,b)=>a+b,0)/nums.length;
    const asc = nums.every((n,i)=>i===0||n>=nums[i-1]);
    const desc = nums.every((n,i)=>i===0||n<=nums[i-1]);
    if (avg<=5) return {type:'low',desc:CARD_INTERACTIONS.numberPatterns.lowNumbers};
    if (avg>=8) return {type:'high',desc:CARD_INTERACTIONS.numberPatterns.highNumbers};
    if (asc&&nums.length>1) return {type:'asc',desc:CARD_INTERACTIONS.numberPatterns.ascending};
    if (desc&&nums.length>1) return {type:'desc',desc:CARD_INTERACTIONS.numberPatterns.descending};
    return {type:'mid',desc:CARD_INTERACTIONS.numberPatterns.midNumbers};
}
function analyzeElementDistribution(cards) {
    const suits = [...new Set(cards.filter(c=>c.suit).map(c=>c.suit))];
    if (suits.length===2) { const k=suits.sort().join('+'); return CARD_INTERACTIONS.elementDynamics[k]||null; }
    return null;
}
function checkMajorCombos(cards) {
    const names = cards.filter(c=>c.arcana==='major').map(c=>c.nameEn);
    for (const [k,v] of Object.entries(CARD_INTERACTIONS.majorCombos)) {
        if (k.split('+').every(n=>names.includes(n))) return v;
    }
    return null;
}

function generateDynamicCardInterpretation(card, idx, spreadCfg, allCards, pfCtx) {
    const posName = spreadCfg.positions[idx];
    const d = UserProfile.data || {};
    const concerns = d.concerns || [];
    const mood = d.mood;
    const sr = seededRandom((_readingSessionId||1)+idx+card.id);
    let interp = '';

    const posCtx = {
        '过去': () => pickRandom([`在过去的位置上，${card.name}揭示了这段经历的根源。`,`回望过去，${card.name}是你生命故事中的一个重要章节。`,`${card.name}出现在过去位，说明这段能量已经塑造了今天的你。`]),
        '现在': () => pickRandom([`当下的能量由${card.name}主导——这正是你此刻所处的状态。`,`${card.name}落在现在的位置，像一盏灯照亮了你当前的处境。`,`此时此刻，${card.name}的能量最为强烈地影响着你的生活。`]),
        '未来': () => pickRandom([`看向未来，${card.name}暗示着可能的发展方向。`,`${card.name}在未来位出现，为接下来的旅程投下了一束光。`,`如果沿着当前的轨迹发展，${card.name}预示着前方等待着你的是什么。`]),
        '建议': () => pickRandom([`${card.name}作为建议牌，它的讯息值得认真对待。`,`当${card.name}以建议的姿态出现时，它在告诉你……`,`来自${card.name}的建议是：`]),
        '核心': () => pickRandom([`${card.name}位于核心位置——它是整个牌阵的灵魂所在。`,`整组牌围绕${card.name}展开，这说明它是你目前最需要关注的焦点。`,`作为核心牌，${card.name}承载着最重要的讯息。`]),
        '阻碍': () => pickRandom([`${card.name}在这里指出了一个需要面对的挑战。`,`阻碍位置的${card.name}揭示了什么在阻挡你前进。`,`不要害怕——${card.name}作为障碍牌出现，恰恰说明你有能力跨越它。`]),
        '希望': () => pickRandom([`${card.name}带来了希望的光芒。即使在不确定的时刻，这张牌也在告诉你：一切都会好的。`,`希望位的${card.name}是一个非常积极的信号——宇宙没有放弃你。`,`让${card.name}的希望之光照亮你前行的路吧。`]),
        '结果': () => pickRandom([`如果一切按照牌面的指引发展，最终的结果可能与${card.name}相关。`,`${card.name}作为结果牌，展示了事情可能的最终面貌。`,`结局尚未写定，但${card.name}给出了一个可能的轮廓。`]),
    };
    const fn = posCtx[posName];
    if (fn) interp += fn() + ' ';

    const ci = generateConcernBasedInsight(card, concerns, mood);
    interp += ci ? ci + ' ' : generateVariantMeaning(card, sr) + ' ';
    interp += generatePsychologicalAngle(card, idx, allCards, sr);
    return interp;
}

function generateConcernBasedInsight(card, concerns, mood) {
    const ins = [];
    const careerMap = {'The Magician':'在职场上，魔术师暗示你正处于一个可以将想法变为现实的黄金时期——大胆提出你的方案吧。','The Chariot':'战车牌在事业维度上是一个强有力的信号：通过坚持和专注，你的职业目标完全可以实现。','The Emperor':'皇帝牌提示建立更好的工作秩序和边界感——清晰的规则会让你在职场中更有掌控力。','Eight of Pentacles':'星币八非常明确地在说：事业上的成功来自于日复一日的精进和打磨。','Three of Wands':'权杖三预示着你的事业视野正在扩展——也许是新的合作机会或是项目进入了扩张期。'};
    if (concerns.includes('career')) { if (careerMap[card.nameEn]) ins.push(careerMap[card.nameEn]); else if (card.suit==='wands') ins.push(`从事业发展角度看，这张${card.name}（权杖牌）暗示着行动和主动性是关键。`); else if (card.suit==='pentacles') ins.push(`${card.name}在物质层面提醒你：事业的根基在于扎实的积累和实际的付出。`); }
    const loveMap = {'The Lovers':'恋人牌在感情语境下不言而喻——一段重要的关系或情感抉择正在你的人生舞台上上演。','Two of Cups':'圣杯二是一张典型的感情和谐之牌。如果已有伴侣关系正在升温；如果单身可能遇到有缘人。','The Empress':'皇后牌在感情中代表着丰盛的爱意和温柔的滋养——现在是打开心扉的好时机。','Ten of Cups':'圣杯十描绘的是情感满足和家庭幸福的终极画面。','Knight of Cups':'圣杯骑士常常带来浪漫的消息——一个充满魅力的人或动人的告白可能正在路上。'};
    if (concerns.includes('love')) { if (loveMap[card.nameEn]) ins.push(loveMap[card.nameEn]); else if (card.suit==='cups') ins.push(`在感情维度上，${card.name}（圣杯牌）邀请你更多地信任自己的感受和直觉。`); }
    const wealthMap = {'Ace of Pentacles':'钱币首牌是财务方面的新起点信号——可能是新的收入来源或投资机会。','Nine of Pentacles':'钱币九描绘的是财务独立和自我充实的美好状态。','King of Pentacles':'钱币国王代表财富的稳定增长和精明的理财能力。'};
    if (concerns.includes('wealth')) { if (wealthMap[card.nameEn]) ins.push(wealthMap[card.nameEn]); else if (card.suit==='pentacles') ins.push(`在财务层面，${card.name}提示你关注物质的实际情况。`); }
    const decisionMap = {'Two of Swords':'宝剑二精准地描述了决策困境——需要在两个选项之间做出艰难的选择。关键是不要拖延太久。','The Hanged Man':'倒吊人在决策语境下：有时候最好的决定是暂停。换个角度看问题，答案可能会变得清晰。'};
    if (concerns.includes('decision')) { if (decisionMap[card.nameEn]) ins.push(decisionMap[card.nameEn]); else if (card.suit==='swords') ins.push(`面对抉择时，${card.name}建议用冷静的分析头脑来处理。`); }
    if (mood==='anxious' && card.number && card.number<=5) ins.push(`结合你近期焦虑的情绪，这张编号较小的${card.name}似乎在温柔地说：不需要一下子解决所有问题，从小事做起就好。`);
    if (mood==='sad' && ['The Star','The Sun','Ace of Cups'].includes(card.nameEn)) ins.push(`${card.name}在你情绪低落时出现，就像黑暗中的一束光——请相信，阴霾终会散去。`);
    if (mood==='confused' && ['The Hermit','The High Priestess','The Moon'].includes(card.nameEn)) ins.push(`迷茫时期遇到${card.name}是一个深刻的指引：答案不在外面，而在你的内在智慧之中。`);
    return ins.length > 0 ? pickRandom(ins) : null;
}

function generateVariantMeaning(card, rand) {
    const v = [card.uprightMeaning, `从另一个角度来看，${card.name}也可以这样理解：${card.advice}`, `${card.keywords.slice(0,3).join('、')}——这三个关键词概括了${card.name}在此处的核心信息。`, `牌面上的${card.name}在轻声诉说着：${card.uprightMeaning.substring(0,30)}...`];
    return v[Math.floor(rand*v.length)] || card.uprightMeaning;
}

function generatePsychologicalAngle(card, idx, allCards, rand) {
    const a = [`从心理学角度观察，${card.psychologicalInsight.substring(0,50)}...`,`荣格学派可能会这样解读${card.name}：这张牌触及了集体潜意识中关于"${pickRandom(card.keywords)}"的原型意象。`,`在认知行为疗法（CBT）的框架下，${card.name}可以被理解为一种认知模式的隐喻——它反映了你当前如何看待自己和世界。`,`从人本主义心理学的视角看，${card.name}指向了自我实现过程中的一个关键环节。`,`正念心理学会将${card.name}视为一种觉察的练习——它邀请你去观察而非评判当下的体验。`];
    return a[Math.floor(rand*a.length)];
}

function generateCardConnection(prev, curr) {
    const t = [`与上一张${prev.name}相比，${curr.name}引入了一种新的能量维度。`,`紧随${prev.name}之后的${curr.name}，形成了一个有趣的叙事弧线。`,`从${prev.name}过渡到${curr.name}，暗示着能量正在发生转变。`,`${prev.name}铺陈了背景，而${curr.name}则将故事推向了新的方向。`];
    const ck = `${prev.nameEn}+${curr.nameEn}`;
    const sc = CARD_INTERACTIONS.majorCombos[ck];
    if (sc) return sc;
    if (prev.suit && curr.suit && prev.suit!==curr.suit) {
        const ek = [prev.suit, curr.suit].sort().join('+');
        const en = CARD_INTERACTIONS.elementDynamics[ek];
        if (en) return pickRandom(t)+' '+en;
    }
    return pickRandom(t);
}

function generateCompositeReading(spreadConfig, question) {
    createReadingSession();
    let html = '<div class="card-interpretation">';
    const pfCtx = getProfileContext();
    const cards = AppState.drawnCards;

    const ofn = pickRandom(READING_VARIANTS.openings);
    const ot = ofn(cards, question);
    html += `<div class="interp-section" style="border-left-color:var(--accent-gold);background:rgba(232,197,71,0.03)"><h4>🔮 牌阵开启</h4><p>${ot}</p>${pfCtx?`<p style="margin-top:0.6rem;font-size:0.89rem;color:var(--accent-teal)">👤 本次解读参考了你的个人情况：${pfCtx}</p>`:''}</div>`;

    const kw = [...new Set(cards.flatMap(c=>c.keywords))].slice(0,6);
    const hasMajor = cards.some(c=>c.arcana==='major');
    const suits = [...new Set(cards.filter(c=>c.suit).map(c=>c.suit))];
    const sn = {wands:'行动力与创造力',cups:'情感与直觉',swords:'思想与沟通',pentacles:'物质与实际'};
    const sf = suits.length>0 && suits.length<=2 ? suits.map(s=>sn[s]).join('和') : '';
    const efn = pickRandom(READING_VARIANTS.energySummaries);
    const et = efn(kw, hasMajor, sf);
    const mc = checkMajorCombos(cards);
    const en = analyzeElementDistribution(cards);
    const np = analyzeNumberPattern(cards);
    html += `<div class="interp-section"><h4>⚡ 能量全貌</h4><p>${et}</p>${mc?`<p style="margin-top:0.7rem;padding:0.6rem 0.8rem;background:rgba(168,85,247,0.06);border-radius:8px;font-size:0.9rem"><strong>🔗 牌面共鸣：</strong>${mc}</p>`:''}${en?`<p style="margin-top:0.7rem;padding:0.6rem 0.8rem;background:rgba(96,165,250,0.06);border-radius:8px;font-size:0.9rem"><strong>🌊 元素互动：</strong>${en}</p>`:''}${np?`<p style="margin-top:0.7rem;padding:0.6rem 0.8rem;background:rgba(45,212,191,0.06);border-radius:8px;font-size:0.9rem"><strong>📊 数字韵律：</strong>${np.desc}</p>`:''}</div>`;

    cards.forEach((card, idx) => {
        const di = generateDynamicCardInterpretation(card, idx, spreadConfig, cards, pfCtx);
        let ch = '';
        if (idx > 0) { const cn = generateCardConnection(cards[idx-1], card, idx); ch = `<div style="margin:0.8rem 0;padding:0.5rem 0.8rem;border-left:2px solid rgba(168,85,247,0.3);font-size:0.88rem;color:var(--text-secondary);background:rgba(168,85,247,0.03);border-radius:0 8px 8px 0">🔗 ${cn}</div>`; }
        html += `<div class="interp-section"><h4>${card.symbol} ${card.name} — ${spreadConfig.positions[idx]}</h4>${ch}<p><strong>📖 牌面解读：</strong></p><p style="margin-top:0.4rem">${di}</p></div><div class="interp-section interp-psychological"><h4>🧠 内在洞察</h4><p>${card.psychologicalInsight}</p></div><div class="interp-section interp-advice"><h4>💡 此刻可行之事</h4><p>${generateDynamicAdvice(card,idx)}</p></div>`;
    });

    const og = generateDynamicOverallGuidance(cards, spreadConfig, pfCtx);
    html += `<div class="interp-section" style="border-left-color:var(--accent-gold);background:rgba(232,197,71,0.02)"><h4>✨ 牌阵结语</h4><p>${og}</p></div>`;
    html += `<div style="margin-top:1.5rem;padding:1rem;background:rgba(244,63,94,0.04);border:1px solid rgba(244,63,94,0.1);border-radius:12px;font-size:0.84rem;color:var(--text-muted);text-align:center;line-height:1.6">🌙 以上解读仅供自我探索与娱乐参考<br>塔罗牌是一面镜子，帮助你更好地认识自己，而非预测未来的工具<br>如遇持续的心理困扰，建议寻求专业心理咨询师的帮助 💜</div>`;
    html += '</div>';
    return html;
}

function generateDynamicAdvice(card, idx) {
    const av = [card.advice, `具体来说，你可以尝试这样做：${card.advice.toLowerCase()}`, `将${card.name}的智慧转化为行动：${card.keywords[0]}是你今天可以聚焦的关键词。`, `一个小小的实践建议：花几分钟思考一下"${pickRandom(card.keywords)}"这个词对你的意义。`];
    return av[((_readingSessionId||1)+idx+card.id)%av.length] || card.advice;
}

function generateDynamicOverallGuidance(cards, spreadCfg, pfCtx) {
    const cfn = pickRandom(READING_VARIANTS.closings);
    let ss = '';
    switch(AppState.currentSpread) {
        case 'daily': ss='作为每日占卜，这些讯息主要适用于接下来的24-48小时。保持觉察，你会注意到牌面能量在日常生活中的投射。'; break;
        case 'celtic': ss='凯尔特十字牌阵提供了非常全面的信息图谱。建议你不要试图一次性消化所有内容，而是分几次回来阅读。'; break;
        case 'relationship': ss='关系牌阵的解读核心在于"连接"——不仅是你与他人之间的连接，更是你与自己内在各个部分的连接。'; break;
        case 'decision': ss='抉择牌阵的目的不是替你做决定，而是帮你厘清每个选项背后的动力和潜在结果。'; break;
    }
    let ei = '';
    const mc = cards.filter(c=>c.arcana==='major').length;
    if (mc > cards.length/2) ei=' 这次解读中大阿尔卡纳占据主导地位，说明你正在处理人生层面的重要课题，值得深入探索。';
    else if (mc===0) ei=' 全部是小阿尔卡纳牌，这意味着答案藏在日常生活的细节之中。关注身边的小事，它们往往蕴含重要线索。';
    return cfn(pfCtx)+' '+ss+ei;
}


// ========== 卡牌详情弹窗 ==========
function showCardDetail(card) {
    const modal = document.getElementById('cardModal');
    const body = document.getElementById('modalBody');
    
    if (!modal || !body) return;

    body.innerHTML = `
        <div class="modal-card-header">
            <div class="modal-card-icon" style="background: linear-gradient(145deg, ${card.color}22, ${card.color}44); border-color: ${card.color};">
                ${card.symbol}
            </div>
            <div class="modal-card-name">${card.name}</div>
            <div class="modal-card-name-en">${card.nameEn}${card.number !== undefined ? ` #${card.number}` : ''}</div>
            ${card.element ? `<div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.3rem;">元素：${card.element} | ${card.astrology || ''}</div>` : ''}
            <div class="modal-keywords">
                ${card.keywords.map(k => `<span>${k}</span>`).join('')}
            </div>
        </div>

        <div class="modal-detail-section">
            <h5>📖 正位解读</h5>
            <p>${card.uprightMeaning}</p>
        </div>

        <div class="modal-detail-section">
            <h5>🔄 逆位含义</h5>
            <p>${card.reversedMeaning}</p>
        </div>

        <div class="modal-detail-section">
            <h5>🧠 心理学洞察</h5>
            <p>${card.psychologicalInsight}</p>
        </div>

        <div class="modal-detail-section">
            <h5>💡 人生建议</h5>
            <p>${card.advice}</p>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('cardModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// 点击遮罩关闭弹窗
document.addEventListener('click', (e) => {
    if (e.target.id === 'cardModal') {
        closeModal();
    }
});

// ESC关闭弹窗
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ========== 咨询功能 ==========
function bookConsultation(counselorName) {
    const formContainer = document.getElementById('bookingFormContainer');
    const selectedCounselorEl = document.getElementById('selectedCounselor');
    
    if (formContainer && selectedCounselorEl) {
        selectedCounselorEl.textContent = counselorName;
        formContainer.style.display = 'block';
        
        // 滚动到表单
        setTimeout(() => {
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

function closeBookingForm() {
    const formContainer = document.getElementById('bookingFormContainer');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
}

function submitBooking(event) {
    event.preventDefault();
    
    // 模拟提交成功
    alert('✨ 预约请求已提交！\n\n我们的咨询师将在24小时内与您联系确认预约时间。\n\n感谢您选择塔罗心灵驿站 💜');
    closeBookingForm();
    
    // 重置表单
    event.target.reset();
}

// ========== 工具函数 ==========

// 获取当前时间问候语
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 12) return '早上好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 控制台欢迎信息
console.log(
    '%c ✧ 塔罗心灵驿站 ✧ ',
    'background: linear-gradient(135deg, #1a1040, #2a2a5e); color: #d4af37; font-size: 16px; padding: 10px 20px; border-radius: 6px; font-weight: bold;'
);
console.log(
    '%c 探索内心深处的智慧之光 🌙',
    'color: #9b59b6; font-size: 12px;'
);
