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

function generateCompositeReading(spreadConfig, question) {
    let html = '<div class="card-interpretation">';
    
    // 获取个人情况上下文
    const profileContext = getProfileContext();

    // 如果有个人情况，显示个性化解读提示
    if (profileContext) {
        html += `
            <div class="interp-section" style="border-left-color: var(--accent-teal); background: rgba(26, 188, 156, 0.03);">
                <h4>👤 你的专属解读</h4>
                <p>基于你的个人情况：<em>${profileContext}</em></p>
                <p style="margin-top:0.5rem;">以下解读将结合你的具体情况进行分析。</p>
            </div>
        `;
    }

    // 综合概述
    const keywords = AppState.drawnCards.flatMap(c => c.keywords).slice(0, 8);
    html += `
        <div class="interp-section">
            <h4>🔮 综合能量</h4>
            <p>本次${spreadConfig.name}展现的核心主题：<strong>${keywords.join(' · ')}</strong>。这些牌面的组合暗示着生命正在经历一次重要的能量转换。每一张牌都是你内心世界的一面镜子，共同编织出当前生命阶段的完整图景。</p>
        </div>
    `;

    // 逐牌解读（融合个人情况）
    AppState.drawnCards.forEach((card, index) => {
        const personalizedMeaning = personalizeCardReading(card, index, profileContext);
        
        html += `
            <div class="interp-section">
                <h4>${card.symbol} ${card.name} — ${spreadConfig.positions[index]}</h4>
                <p><strong>正位含义：</strong>${card.uprightMeaning}</p>
                ${personalizedMeaning ? `<p style="margin-top:0.6rem; padding:0.6rem; background:rgba(155,89,182,0.05); border-radius:8px; font-size:0.9rem;"><strong>💫 结合你的情况：</strong>${personalizedMeaning}</p>` : ''}
            </div>
            
            <div class="interp-section interp-psychological">
                <h4>🧠 心理学视角</h4>
                <p>${card.psychologicalInsight}</p>
            </div>
            
            <div class="interp-section interp-advice">
                <h4>💡 建议</h4>
                <p>${card.advice}</p>
            </div>
        `;
    });

    // 整体建议（融入个人情况）
    html += `
        <div class="interp-section" style="border-left-color: var(--accent-gold);">
            <h4>✨ 整体指引</h4>
            <p>${generateOverallGuidance()}</p>
        </div>
    `;

    // 温馨提示
    html += `
        <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(231, 76, 60, 0.05); border-radius: 10px; font-size: 0.85rem; color: var(--text-muted); text-align: center;">
            ⚠️ 以上解读仅供参考和娱乐，塔罗牌是自我探索的工具而非预言。如遇心理困扰，请寻求专业心理咨询师的帮助。
        </div>
    `;

    html += '</div>';
    return html;
}

/**
 * 根据用户个人情况为每张牌生成个性化解读
 */
function personalizeCardReading(card, positionIndex, profileContext) {
    if (!profileContext) return '';
    
    const d = UserProfile.data;
    let personalized = '';
    const concerns = d.concerns || [];
    const mood = d.mood;
    const lifeStage = d.lifeStage;
    const occupation = d.occupation;

    // 根据关注领域定制解读
    if (concerns.includes('career') && card.suit === 'wands') {
        personalized += '从事业角度看，这张权杖牌暗示着你在工作中需要更加主动和有创造力。';
    }
    if (concerns.includes('love') && card.suit === 'cups') {
        personalized += '在感情层面，这张圣杯牌揭示了情感世界中的重要讯息——倾听内心的声音，真实的感受值得被看见。';
    }
    if (concerns.includes('wealth') && card.suit === 'pentacles') {
        personalized += '在物质与财务方面，这张钱币牌提醒你关注实际层面的积累和规划。';
    }
    if (concerns.includes('decision') && card.suit === 'swords') {
        personalized +='面对重要抉择时，这张宝剑牌建议你用清晰的思维来分析利弊，而非被情绪左右。';
    }

    // 根据情绪状态定制
    if (mood === 'anxious' && card.number >= 8 && card.arcana === 'minor') {
        personalized += (personalized ? ' ' : '') + '结合你近期焦虑的状态，这张牌的出现可能是在提醒：你已经比想象中更有能力应对挑战。';
    }
    if (mood === 'confused' && (card.nameEn === 'The Hermit' || card.nameEn === 'The High Priestess')) {
        personalized += (personalized ? ' ' : '') + '迷茫时期出现这张牌是一个积极的信号——答案就在你的内在智慧之中，给自己一些静默的时间。';
    }
    if (mood === 'sad' && (card.nameEn === 'The Star' || card.nameEn === 'The Sun')) {
        personalized += (personalized ? ' ' : '') + '在你感到低落的时候抽到这张牌，宇宙在温柔地告诉你：最黑暗的时刻往往预示着光明的到来。';
    }

    // 根据人生阶段定制
    if (lifeStage === 'student' && card.nameEn === 'The Magician') {
        personalized += (personalized ? ' ' : '') + '作为学生，魔术师牌鼓励你将所学知识转化为实际的创造力和行动力。';
    }
    if (lifeStage === 'early_career' && card.nameEn === 'The Chariot') {
        personalized += (personalized ? ' ' : '') + '职场新人阶段遇到战车牌，预示着通过坚持和努力，你将在职业道路上取得突破。';
    }
    if ((lifeStage === 'midlife_transition' || lifeStage === 'established') && card.nameEn === 'Death') {
        personalized += (personalized ? ' ' : '') + '在你当前的人生阶段，死神牌更多象征着积极的意义——是时候放下不再服务于你的旧模式，为新的人生篇章腾出空间了。';
    }

    return personalized;
}

function generateOverallGuidance() {
    const hasMajor = AppState.drawnCards.some(c => c.arcana === 'major');
    const suits = new Set(AppState.drawnCards.map(c => c.suit).filter(Boolean));
    const profileContext = getProfileContext();
    
    let guidance = '从整体来看，';

    if (hasMajor) {
        guidance += '大阿尔卡纳的出现意味着这次解读触及了你生命中较为核心和深层的议题。宇宙在邀请你进行一次重要的内在对话。';
    } else {
        guidance += '小阿尔卡纳的组合指向日常生活中具体而实际的层面。关注当下的细节，答案往往藏在日常之中。';
    }

    if (suits.size <= 2 && suits.size > 0) {
        const suitNames = { wands: '行动力/创造力', cups: '情感/直觉', swords: '思想/沟通', pentacles: '物质/实际' };
        const focusAreas = Array.from(suits).map(s => suitNames[s]).join('和');
        guidance += `牌面集中在${focusAreas}领域，这是目前最需要你投入关注的能量方向。`;
    }

    // 融合个人情况的额外指引
    const d = UserProfile.data;
    if (d.mood === 'anxious') {
        guidance += ' 结合你近期焦虑的情绪状态，牌面在温柔地提醒：焦虑往往源于对未知的恐惧，而你比想象中更有力量去面对它。';
    }
    if (d.mood === 'confused') {
        guidance += ' 在迷茫的时刻，这些牌面就像一盏灯——不需要立刻看清整条路，只需要照亮脚下的下一步。';
    }
    if (d.concerns && d.concerns.includes('decision')) {
        guidance += ' 面对重要抉择，塔罗牌不是替你做决定，而是帮助你看见自己内心深处真正想要的是什么。';
    }
    if (profileContext && d.lifeStage) {
        guidance += ` 在你当前的人生阶段，这些讯息具有特别的意义——信任这个过程，每一步都在塑造更好的自己。`;
    }

    guidance += '记住，塔罗牌不会决定你的命运——它只是帮助你更清晰地看见自己。真正的力量始终在你手中。';

    return guidance;
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
