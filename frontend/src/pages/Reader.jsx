import React, { useState, useEffect, useRef, useCallback } from 'react';
import request from '../api/request';

const SAMPLE_CHAPTERS = [
    '第一章 初入江湖',
    '暮色低垂，残阳如血。林风站在青石板铺就的古道上，望着远方连绵起伏的山脉，心中不禁生出一股苍凉之感。他已经走了整整三天三夜，脚底的水泡磨破了又结，结了又破，每走一步都传来钻心的疼痛。',
    '路旁的老槐树上，几只乌鸦发出嘶哑的叫声，仿佛在为这落寞的旅人吟唱哀歌。林风紧了紧身上的破旧行囊，那里面只有几件换洗衣物和半块干硬的窝头。他抬起头，看着天边最后一抹余晖消失在山巅，深深地吸了一口气。',
    '"前方就是落霞镇了。"他喃喃自语，声音沙哑得像是被砂纸打磨过。三天前，他还是青云门中最有天赋的弟子，可是一场突如其来的变故，让他失去了一切。师父惨死，师弟背叛，他自己也被逐出师门，成为了武林中人尽可诛的叛逆。',
    '第二章 奇遇',
    '落霞镇并不大，只有百十户人家。夜幕降临的时候，镇上唯一的一家客栈"悦来栈"还亮着昏黄的灯光。林风摸了摸怀里仅剩的几两碎银，犹豫了一下，还是推门走了进去。',
    '客栈里稀稀拉拉地坐着几个客人，都是些行商打扮的外地人。店小二见林风衣着寒酸，眼中闪过一丝鄙夷，但还是职业性地迎了上来："客官，是打尖还是住店？"',
    '"来一间上房，再准备些吃的。"林风掏出一锭银子放在柜台上，那是他从一个山贼身上搜来的。店小二眼睛一亮，态度立刻恭敬了许多："好嘞，客官您里面请！"',
    '用过晚饭，林风回到房间，关好门窗，盘膝坐在床上开始运功。可是丹田内空空如也，原本浑厚的内力竟然消失得无影无踪。他苦笑一声，看来那场大战不仅让他身受重伤，还废了他一身修为。',
    '第三章 神秘老人',
    '第二天一早，林风早早地起了床。他知道在这里不能久留，青云门的追兵随时可能赶到。他必须尽快找到一个安全的地方，想办法恢复功力，然后查明真相，为师父报仇。',
    '就在他准备离开的时候，楼下忽然传来一阵喧哗。林风探头一看，只见几个身穿青色劲装的大汉正在挨个房间搜查，为首的一人他认识，正是他的师弟赵天霸。',
    '"林风，我知道你躲在这里，还不快快出来束手就擒！"赵天霸的声音响彻整个客栈，"勾结魔教，杀害师父，你这个武林败类，今天我就要清理门户！"',
    '林风心中一凛，知道硬碰硬是不行的。他身形一晃，从后窗跳了出去，几个起落就消失在了镇子后面的密林之中。',
    '第四章 上古传承',
    '密林深处，古树参天，遮天蔽日。林风拼命地往前跑，耳边是呼呼的风声和自己急促的呼吸声。他不知道跑了多久，直到身后再也听不到追兵的声音，才停下脚步扶着一棵大树大口喘气。',
    '"咳...咳..."剧烈的咳嗽牵动了内伤，一丝鲜血从他的嘴角溢出。他抹了抹嘴，抬头打量四周，发现自己竟然来到了一个陌生的山谷。山谷中央有一座破旧的道观，道观的匾额上写着"三清观"三个大字，字迹斑驳，显然已经有些年月了。',
    '林风犹豫了一下，还是迈步走了过去。道观的大门虚掩着，推开门，里面布满了灰尘，显然已经很久没有人来过了。正殿中央供奉着三清道祖的塑像，塑像前的蒲团已经腐烂，供桌上的香炉也早已冷却。',
    '就在他准备转身离开的时候，脚下忽然踩到了一块活动的石板。他心中一动，弯腰搬开石板，发现下面竟然有一个暗格。暗格里放着一个古朴的木盒，木盒上刻着繁复的花纹，散发着淡淡的灵气。',
    '第五章 神功初成',
    '林风小心翼翼地打开木盒，里面放着一本泛黄的古籍和一枚黑色的戒指。古籍的封面上写着"混元真解"四个古篆字，字迹苍劲有力，仿佛要破纸而出。',
    '他翻开第一页，只见上面写着："天地玄黄，宇宙洪荒。混元一气，道法自然..."这竟然是一本失传已久的上古修炼秘籍！林风激动得手都在颤抖，他连忙翻看起来，越看越是心惊。',
    '原来这本秘籍不仅记载了一套高深的修炼功法，还有许多失传的法术和丹药配方。林风按照秘籍上的方法尝试运功，只觉得一股温热的气流从丹田深处升起，沿着经脉缓缓流动，所过之处，原本堵塞的经脉竟然被一一打通。',
    '"这...这是..."他不敢相信自己的眼睛，原本已经消失的内力，竟然在这本秘籍的帮助下重新出现了，而且比之前更加精纯，更加深厚！',
    '第六章 重出江湖',
    '三个月后，林风走出了三清观。此时的他，已经完全脱胎换骨。一身布衣穿在身上，却透着一股超凡脱俗的气质。他的眼神深邃如海，整个人站在那里，就像是一座巍峨的高山，又像是一片深邃的大海。',
    '"青云门，赵天霸，我回来了。"他轻声说道，声音不大，却带着一股斩钉截铁的决心。三个月的时间，他不仅恢复了功力，还修炼了混元真解中的第一层，实力比之前何止强了十倍。',
    '他戴上那枚黑色的戒指，只觉得心念一动，木盒和秘籍就消失在了手中，被收进了戒指的空间里。这枚戒指竟然是一枚储物戒指，里面有大约十丈见方的空间，可以存放物品。',
    '林风辨认了一下方向，纵身一跃，身形如电般向着青云山的方向掠去。他要回去，查清师父被害的真相，让那些背叛他的人，付出应有的代价。',
    '第七章 真相大白',
    '青云山，高耸入云，云雾缭绕。青云门的山门就在半山腰，飞檐翘角，气势恢宏。林风站在山脚下，望着这座他生活了十几年的地方，心中百感交集。',
    '他没有直接闯上山，而是趁着夜色，悄悄地潜入了青云门的禁地——藏书阁。他记得师父曾经说过，藏书阁的顶层有一个密室，里面存放着青云门历代掌门的手记，也许那里会有线索。',
    '避开巡逻的弟子，林风来到了藏书阁的顶层。果然，在一个不起眼的角落里，他找到了机关。转动机关，墙壁缓缓打开，露出了一间密室。',
    '密室里摆放着几个书架，上面放着厚厚的手记。林风快速翻阅，终于在最新的一本手记中找到了他想要的答案。',
    '原来，他的师父玄真子发现了赵天霸与魔教勾结的证据，还没来得及清理门户，就被赵天霸先下手为强，杀人灭口，并且嫁祸给了林风。而赵天霸之所以这么做，是为了夺取青云门的掌门之位，以及玄真子手中的一份藏宝图。',
    '"赵天霸...你好狠的心！"林风紧紧握住拳头，指甲深深地陷入了掌心。',
    '第八章 终局之战',
    '第二天，正是青云门新任掌门的继位大典。赵天霸穿着华丽的掌门服饰，站在大殿之上，接受着门下弟子的朝拜。他的脸上洋溢着得意的笑容，仿佛已经看到了自己称霸武林的未来。',
    '"赵天霸，你这个叛徒，还不快快束手就擒！"',
    '就在大典进行到最关键的时候，一个清冷的声音响彻整个大殿。众人循声望去，只见一个身穿布衣的年轻人站在大殿门口，阳光洒在他的身上，仿佛为他镀上了一层金色的光芒。',
    '"林风？你竟然还敢回来！"赵天霸又惊又怒，"来人，给我拿下这个勾结魔教的叛徒！"',
    '然而，那些弟子你看看我，我看看你，竟然没有人敢上前。他们能够感觉到，现在的林风，身上散发着一股让人心悸的气息，那是他们望尘莫及的强大。',
    '"赵天霸，你勾结魔教，杀害师父，嫁祸于我，今天就是你的死期！"林风迈步走入大殿，每走一步，身上的气势就增强一分。',
    '赵天霸知道今天不能善了，他一咬牙，拔出佩剑，向着林风刺了过去。剑光闪烁，带着凌厉的杀气。',
    '林风站在那里，一动不动。就在剑尖即将刺中他眉心的时候，他缓缓抬起手，两根手指竟然精准地夹住了剑刃。',
    '"这...这怎么可能！"赵天霸瞪大了眼睛，不敢相信自己的眼睛。他用尽全身力气，却无法将剑再推进半分。',
    '"你太弱了。"林风淡淡地说道，手指微微用力，只听"咔嚓"一声，精钢打造的佩剑竟然被他硬生生折断。',
    '赵天霸吓得魂飞魄散，转身就想逃跑。可是林风怎么可能给他机会？他随手一指，一道剑气射出，正中赵天霸的后心。赵天霸闷哼一声，扑倒在地，当场毙命。',
    '尾声',
    '真相大白之后，林风本想离开青云门，继续自己的江湖之路。可是在众位长老和弟子的苦苦哀求下，他最终还是接过了掌门之位。',
    '站在青云山的最高峰，望着脚下的云海，林风想起了师父曾经对他说过的话："能力越大，责任越大。江湖路远，你要记住，无论何时何地，都要坚守自己的本心。"',
    '"师父，您放心，我不会让您失望的。"他轻声说道，声音随风飘散在云海之间。',
    '而他的故事，才刚刚开始...'
];

const Reader = ({ book, user, onBack }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(SAMPLE_CHAPTERS.length);
    const [progress, setProgress] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const saveTimeoutRef = useRef(null);
    const contentRef = useRef(null);

    const fetchProgress = useCallback(async () => {
        if (!user || !book) return;
        try {
            const data = await request.get(`/reading-progress?userId=${user.id}&bookId=${book.id}`);
            if (data) {
                setCurrentPage(data.currentPage || 1);
                setTotalPages(data.totalPages || SAMPLE_CHAPTERS.length);
                setProgress(data.progressPercent || 0);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [user, book]);

    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    useEffect(() => {
        const percent = ((currentPage - 1) / (totalPages - 1)) * 100;
        setProgress(Math.min(100, Math.max(0, percent)));
    }, [currentPage, totalPages]);

    const saveProgress = useCallback(async (page, force = false) => {
        if (!user || !book) return;
        
        const percent = ((page - 1) / (totalPages - 1)) * 100;
        const progressPercent = Math.min(100, Math.max(0, percent));

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        if (force) {
            setIsSaving(true);
            try {
                await request.post('/reading-progress', {
                    userId: user.id,
                    bookId: book.id,
                    currentPage: page,
                    totalPages: totalPages,
                    progressPercent: progressPercent
                });
            } catch (e) {
                console.error('保存进度失败', e);
            } finally {
                setIsSaving(false);
            }
        } else {
            saveTimeoutRef.current = setTimeout(async () => {
                setIsSaving(true);
                try {
                    await request.post('/reading-progress', {
                        userId: user.id,
                        bookId: book.id,
                        currentPage: page,
                        totalPages: totalPages,
                        progressPercent: progressPercent
                    });
                } catch (e) {
                    console.error('保存进度失败', e);
                } finally {
                    setIsSaving(false);
                }
            }, 500);
        }
    }, [user, book, totalPages]);

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
                saveProgress(currentPage, true);
            }
        };
    }, [currentPage, saveProgress]);

    const goToPage = (page) => {
        const newPage = Math.max(1, Math.min(totalPages, page));
        setCurrentPage(newPage);
        saveProgress(newPage);
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    };

    const handlePageInput = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
            goToPage(value);
        }
    };

    const handleProgressClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const page = Math.round(percent * (totalPages - 1)) + 1;
        goToPage(page);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-amber-700">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
            <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-amber-100 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => {
                            saveProgress(currentPage, true);
                            setTimeout(onBack, 100);
                        }}
                        className="flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        返回
                    </button>
                    <div className="text-center">
                        <h1 className="font-bold text-amber-900">{book?.title || '阅读'}</h1>
                        <p className="text-xs text-amber-500">{book?.author}</p>
                    </div>
                    <div className="w-16 flex items-center justify-end gap-1">
                        {isSaving && (
                            <span className="text-xs text-amber-500 flex items-center gap-1">
                                <svg className="animate-spin w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                保存中
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
                    <div 
                        className="cursor-pointer h-2 bg-amber-100 relative"
                        onClick={handleProgressClick}
                    >
                        <div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-orange-500 transition-all duration-300"
                            style={{ left: `calc(${progress}% - 8px)` }}
                        ></div>
                    </div>

                    <div 
                        ref={contentRef}
                        className="p-8 md:p-12 min-h-[600px] flex flex-col"
                    >
                        <div className="flex-1">
                            <div className="prose prose-lg max-w-none">
                                <div className="whitespace-pre-wrap text-gray-800 leading-loose text-lg tracking-wide font-serif">
                                    {SAMPLE_CHAPTERS[currentPage - 1] || '内容加载中...'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pb-6">
                        <div className="flex items-center justify-between text-sm text-amber-600">
                            <span>第 1 页</span>
                            <span className="font-medium">
                                已读 {progress.toFixed(1)}%
                            </span>
                            <span>第 {totalPages} 页</span>
                        </div>
                    </div>

                    <div className="bg-amber-50/50 border-t border-amber-100 px-8 py-4">
                        <div className="flex items-center justify-between gap-4">
                            <button
                                onClick={prevPage}
                                disabled={currentPage <= 1}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                                    currentPage <= 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200 active:scale-95'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                                上一页
                            </button>

                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max={totalPages}
                                    value={currentPage}
                                    onChange={handlePageInput}
                                    className="w-16 px-3 py-2 text-center border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none"
                                />
                                <span className="text-amber-600">/</span>
                                <span className="text-amber-700 font-medium">{totalPages}</span>
                            </div>

                            <button
                                onClick={nextPage}
                                disabled={currentPage >= totalPages}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                                    currentPage >= totalPages
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl active:scale-95'
                                }`}
                            >
                                下一页
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center text-sm text-amber-500">
                    <p>提示：翻页或退出时自动保存阅读进度</p>
                </div>
            </div>
        </div>
    );
};

export default Reader;
