/* ============================================================
   省份数据层（34 个省级行政区）— 全部为模拟演示数据
   ============================================================ */
window.PROVINCES = {
  "北京": {
    full: "北京市", region: "华北", capital: "北京",
    candidates: 5.4, univs: 92, doubleFirst: 34, gaokao: "3+3",
    specialLineP: 523, specialLineH: 513,
    hot: ["计算机", "人工智能", "金融", "临床医学"],
    note: "教育资源全国断层第一，但本地考生录取率高；外地考生去北京读双非，性价比要自己算清楚——要的是平台和眼界。",
    industry: "互联网、金融、总部经济、科研院所"
  },
  "天津": {
    full: "天津市", region: "华北", capital: "天津",
    candidates: 7.0, univs: 56, doubleFirst: 14, gaokao: "3+3",
    specialLineP: 508, specialLineH: 505,
    hot: ["临床医学", "电气", "计算机", "财经"],
    note: "高考天堂之一，本地考生少、高校多；天津户口红利明显，重点看天大南开辐射下的工科就业圈。",
    industry: "高端制造、港口物流、生物医药"
  },
  "河北": {
    full: "河北省", region: "华北", capital: "石家庄",
    candidates: 84.3, univs: 122, doubleFirst: 4, gaokao: "3+1+2",
    specialLineP: 492, specialLineH: 495,
    hot: ["计算机", "师范", "临床医学", "机械"],
    note: "考生多、省内好学校少，是典型的'出去上大学'省份；河北孩子要认清：本省没有 985，别把宝全押在省内。",
    industry: "钢铁、装备制造、新能源"
  },
  "山西": {
    full: "山西省", region: "华北", capital: "太原",
    candidates: 34.2, univs: 82, doubleFirst: 3, gaokao: "3+1+2",
    specialLineP: 480, specialLineH: 490,
    hot: ["煤炭相关能源", "师范", "医学", "计算机"],
    note: "能源转型期，传统专业需求收缩；山西考生尽量往外走、往新产业走，省内就业池子在变小。",
    industry: "能源、煤化工转型、文旅"
  },
  "内蒙古": {
    full: "内蒙古自治区", region: "华北", capital: "呼和浩特",
    candidates: 21.2, univs: 54, doubleFirst: 1, gaokao: "3+1+2",
    specialLineP: 470, specialLineH: 480,
    hot: ["能源", "畜牧兽医", "师范", "医学"],
    note: "地广人稀、考生总量小，竞争相对温和；但优质岗位也少，顶尖孩子建议去京津冀圈层。",
    industry: "能源、乳业、稀土新材料"
  },
  "辽宁": {
    full: "辽宁省", region: "东北", capital: "沈阳",
    candidates: 21.9, univs: 116, doubleFirst: 9, gaokao: "3+1+2",
    specialLineP: 495, specialLineH: 500,
    hot: ["电气", "机械", "计算机", "临床医学"],
    note: "老工业基地高校底子厚，大工、东大都是硬牌子；就业认'东北老牌工科'的南方企业不少，是工科生的性价比洼地。",
    industry: "装备制造、软件(大连)、石化"
  },
  "吉林": {
    full: "吉林省", region: "东北", capital: "长春",
    candidates: 13.0, univs: 62, doubleFirst: 6, gaokao: "3+1+2",
    specialLineP: 488, specialLineH: 493,
    hot: ["汽车工程", "化学", "法学", "医学"],
    note: "考生少、录取率相对友好；吉大体量大、学科全，适合想用中等分数换综合平台的孩子。",
    industry: "汽车、轨道客车、光电"
  },
  "黑龙江": {
    full: "黑龙江省", region: "东北", capital: "哈尔滨",
    candidates: 20.8, univs: 81, doubleFirst: 6, gaokao: "3+1+2",
    specialLineP: 482, specialLineH: 486,
    hot: ["航空航天", "电气", "焊接/材料", "医学"],
    note: "哈工大系实力派，分数相对南方同档 985 友好；但注意气候与就业地的权衡，多数毕业生最终会流向南方。",
    industry: "航空航天、装备制造、农业"
  },
  "上海": {
    full: "上海市", region: "华东", capital: "上海",
    candidates: 5.3, univs: 64, doubleFirst: 25, gaokao: "3+3",
    specialLineP: 540, specialLineH: 532,
    hot: ["金融", "计算机", "医学", "法学"],
    note: "平台含金量极高，金融+总部经济给了文科生大量机会；上海读大学=提前锁定长三角实习圈。",
    industry: "金融、集成电路、生物医药、航运"
  },
  "江苏": {
    full: "江苏省", region: "华东", capital: "南京",
    candidates: 47.8, univs: 167, doubleFirst: 26, gaokao: "3+1+2",
    specialLineP: 512, specialLineH: 516,
    hot: ["电气", "计算机", "机械", "师范"],
    note: "高校质量全国前三，县级市经济都强；江苏考生普遍'不愿出省'，省外名校在苏录取分反而友好。",
    industry: "制造业集群、电子信息、生物医药"
  },
  "浙江": {
    full: "浙江省", region: "华东", capital: "杭州",
    candidates: 39.6, univs: 109, doubleFirst: 15, gaokao: "3+3",
    specialLineP: 513, specialLineH: 515,
    hot: ["计算机", "电子商务", "临床医学", "法学"],
    note: "新经济发达，杭州数字经济岗位密度全国前列；选浙大之外，省内双非在本地就业也吃得开。",
    industry: "数字经济、民营制造、跨境电商"
  },
  "安徽": {
    full: "安徽省", region: "华东", capital: "合肥",
    candidates: 62.5, univs: 121, doubleFirst: 7, gaokao: "3+1+2",
    specialLineP: 498, specialLineH: 502,
    hot: ["计算机", "人工智能", "汽车", "医学"],
    note: "合肥靠'风投城市'逆袭，科大讯飞、蔚来、京东方都在；安徽考生去长三角就业半径极短，性价比高。",
    industry: "新型显示、集成电路、新能源汽车"
  },
  "福建": {
    full: "福建省", region: "华东", capital: "福州",
    candidates: 24.7, univs: 89, doubleFirst: 4, gaokao: "3+1+2",
    specialLineP: 505, specialLineH: 508,
    hot: ["计算机", "财经", "医学", "电子信息"],
    note: "厦大是金字招牌；闽南制造业+对台经贸特色，想留闽就业选工科和财经更对口。",
    industry: "电子信息、鞋服、新能源电池(宁德)"
  },
  "江西": {
    full: "江西省", region: "华东", capital: "南昌",
    candidates: 53.2, univs: 106, doubleFirst: 3, gaokao: "3+1+2",
    specialLineP: 486, specialLineH: 492,
    hot: ["师范", "医学", "法学", "电子信息"],
    note: "高考大省之一，省内头部高校资源偏少，多数高分考生会流向湖北、江苏；'往省外走'是主旋律。",
    industry: "有色金属、航空制造、VR产业"
  },
  "山东": {
    full: "山东省", region: "华东", capital: "济南",
    candidates: 99.7, univs: 153, doubleFirst: 10, gaokao: "3+3",
    specialLineP: 502, specialLineH: 505,
    hot: ["临床医学", "计算机", "师范", "电气"],
    note: "考生破百万量级、竞争惨烈；山东家长最认'编制和稳定'，但孩子们要想清楚：稳定和天花板往往是反义词。",
    industry: "海洋经济、高端化工、医养健康"
  },
  "河南": {
    full: "河南省", region: "华中", capital: "郑州",
    candidates: 131.6, univs: 156, doubleFirst: 5, gaokao: "3+1+2",
    specialLineP: 496, specialLineH: 500,
    hot: ["师范", "临床医学", "计算机", "法学"],
    note: "全国考生第一大省，一个考生背后就是一个家庭的翻身希望；河南孩子要用'分数最大化'策略，能走多远走多远。",
    industry: "装备制造、食品、超硬材料"
  },
  "湖北": {
    full: "湖北省", region: "华中", capital: "武汉",
    candidates: 52.4, univs: 130, doubleFirst: 15, gaokao: "3+1+2",
    specialLineP: 506, specialLineH: 510,
    hot: ["光电/电子信息", "计算机", "医学", "师范"],
    note: "武汉高校密度全国前列，武大华科双子星；'大学之城'留人政策好，是中部最值得留下的省份之一。",
    industry: "光电子(光谷)、汽车、钢铁"
  },
  "湖南": {
    full: "湖南省", region: "华中", capital: "长沙",
    candidates: 68.4, univs: 128, doubleFirst: 11, gaokao: "3+1+2",
    specialLineP: 503, specialLineH: 508,
    hot: ["机械", "计算机", "医学", "土木建筑"],
    note: "三一、中联重科带起工程机械群，长沙房价友好宜居；中南、湖大、湖师大结构合理，本省消化能力强。",
    industry: "工程机械、轨道交通、文娱(马栏山)"
  },
  "广东": {
    full: "广东省", region: "华南", capital: "广州",
    candidates: 76.8, univs: 160, doubleFirst: 12, gaokao: "3+1+2",
    specialLineP: 508, specialLineH: 512,
    hot: ["计算机", "电子信息", "临床医学", "财经"],
    note: "大湾区就业吸纳力全国第一，进可攻退可守；中大华工是本地王者，双非理工在珠三角一样抢手。",
    industry: "互联网、智能制造、金融、外贸"
  },
  "广西": {
    full: "广西壮族自治区", region: "华南", capital: "南宁",
    candidates: 48.5, univs: 85, doubleFirst: 1, gaokao: "3+1+2",
    specialLineP: 478, specialLineH: 485,
    hot: ["师范", "医学", "电气", "机械"],
    note: "高校头部资源有限，考生出省意愿强；东盟通道和新能源(锂电、平陆运河)是本地新机会。",
    industry: "制糖、铝业、面向东盟贸易"
  },
  "海南": {
    full: "海南省", region: "华南", capital: "海口",
    candidates: 7.1, univs: 22, doubleFirst: 1, gaokao: "3+3",
    specialLineP: 508, specialLineH: 512,
    hot: ["旅游管理", "海洋科学", "医学", "计算机"],
    note: "自贸港政策红利期，免税、康养、深海产业招人；本省高校少，高分考生多出岛求学。",
    industry: "自贸港、文旅、深海科技"
  },
  "重庆": {
    full: "重庆市", region: "西南", capital: "重庆",
    candidates: 35.4, univs: 70, doubleFirst: 5, gaokao: "3+1+2",
    specialLineP: 499, specialLineH: 504,
    hot: ["车辆工程", "计算机", "医学", "电气"],
    note: "汽车+电子双产业带，笔电产量全球领先；重大、西南大学本地认可度高，新一线里生活成本友好。",
    industry: "汽车、笔电、医药、金融"
  },
  "四川": {
    full: "四川省", region: "西南", capital: "成都",
    candidates: 76.3, univs: 134, doubleFirst: 13, gaokao: "3+1+2",
    specialLineP: 500, specialLineH: 506,
    hot: ["电子信息", "计算机", "医学", "法学"],
    note: "成都幸福感拉满也'卷'，电子科大、川大+成飞/华为成研所形成闭环；西南就业中心地位稳固。",
    industry: "电子信息、军工、文创、白酒"
  },
  "贵州": {
    full: "贵州省", region: "西南", capital: "贵阳",
    candidates: 46.7, univs: 75, doubleFirst: 1, gaokao: "3+1+2",
    specialLineP: 476, specialLineH: 484,
    hot: ["大数据相关", "师范", "医学", "电气"],
    note: "贵阳大数据产业是亮点，华为云、苹果数据中心落户；但省内高校池小，尖子生建议出省看更广的天地。",
    industry: "大数据、酱酒、旅游"
  },
  "云南": {
    full: "云南省", region: "西南", capital: "昆明",
    candidates: 39.5, univs: 82, doubleFirst: 1, gaokao: "3+1+2",
    specialLineP: 482, specialLineH: 490,
    hot: ["师范", "医学", "旅游/民族相关", "计算机"],
    note: "气候宜人、生活安逸，但产业结构偏轻；云大、昆工守土有责，往外走的云南孩子常能闯出惊喜。",
    industry: "绿色能源、文旅、生物医药(三七)"
  },
  "西藏": {
    full: "西藏自治区", region: "西南", capital: "拉萨",
    candidates: 3.6, univs: 7, doubleFirst: 0, gaokao: "老高考",
    specialLineP: 400, specialLineH: 400,
    hot: ["师范", "藏医", "农林", "计算机"],
    note: "考生最少、有专项政策红利；适合想稳定就业+对高原生活有准备的孩子，注意身体与适应的权衡。",
    industry: "文旅、清洁能源、边境贸易"
  },
  "陕西": {
    full: "陕西省", region: "西北", capital: "西安",
    candidates: 36.4, univs: 97, doubleFirst: 14, gaokao: "3+1+2",
    specialLineP: 492, specialLineH: 498,
    hot: ["航空航天", "电子信息", "计算机", "医学"],
    note: "军工+科教重镇，西交西工大西电三巨头；'孔雀西北飞'不亏，军工院所和硬科技岗位稳定且给力。",
    industry: "航空航天、军工电子、光伏"
  },
  "甘肃": {
    full: "甘肃省", region: "西北", capital: "兰州",
    candidates: 27.4, univs: 49, doubleFirst: 4, gaokao: "3+1+2",
    specialLineP: 468, specialLineH: 478,
    hot: ["核工程", "草业/农学", "医学", "师范"],
    note: "兰大守着西北高等教育的门面，学风扎实；适合想用较低分数换 985 平台的考生。",
    industry: "有色冶金、新能源(风光)、文旅"
  },
  "青海": {
    full: "青海省", region: "西北", capital: "西宁",
    candidates: 6.8, univs: 12, doubleFirst: 1, gaokao: "3+1+2",
    specialLineP: 420, specialLineH: 435,
    hot: ["生态/草业", "医学", "师范", "新能源"],
    note: "人口少、录取政策友好，光伏基地全国领先；外向型就业仍是多数家庭的理性选择。",
    industry: "光伏、锂电、盐湖化工"
  },
  "宁夏": {
    full: "宁夏回族自治区", region: "西北", capital: "银川",
    candidates: 8.3, univs: 20, doubleFirst: 1, gaokao: "3+1+2",
    specialLineP: 442, specialLineH: 452,
    hot: ["师范", "医学", "电气", "葡萄酒相关"],
    note: "考生少、'性价比型'考区，宁夏大学收分友好；注意结合家庭就业半径做选择。",
    industry: "煤化工、枸杞/葡萄酒、算力枢纽"
  },
  "新疆": {
    full: "新疆维吾尔自治区", region: "西北", capital: "乌鲁木齐",
    candidates: 23.1, univs: 55, doubleFirst: 4, gaokao: "老高考",
    specialLineP: 468, specialLineH: 451,
    hot: ["师范", "医学", "石油工程", "农学"],
    note: "棉花、油气、风光资源富集，本地就业稳定；跨省求学者注意提前规划回流或留疆政策。",
    industry: "能源(油气)、棉花纺织、新能源"
  },
  "中国台湾": {
    full: "台湾省", region: "台港澳", capital: "台北",
    candidates: 1.2, univs: 0, doubleFirst: 0, gaokao: "港澳台联考",
    specialLineP: 400, specialLineH: 410,
    hot: ["港澳台联考", "侨生政策", "两岸院校交流"],
    note: "台湾地区考生参加全国联考或依据政策报考大陆高校；欢迎台湾青年来大陆求学发展。",
    industry: "电子信息制造、半导体、精密机械"
  },
  "中国香港": {
    full: "香港特别行政区", region: "台港澳", capital: "香港",
    candidates: 0.6, univs: 0, doubleFirst: 0, gaokao: "DSE/联考",
    specialLineP: 400, specialLineH: 410,
    hot: ["港澳台联考", "国际课程", "大湾区协同"],
    note: "香港学生可经 DSE/联考报读内地高校，大湾区高校与香港高校合作办学通道日益多元。",
    industry: "金融、贸易、专业服务"
  },
  "中国澳门": {
    full: "澳门特别行政区", region: "台港澳", capital: "澳门",
    candidates: 0.4, univs: 0, doubleFirst: 0, gaokao: "联考/保送",
    specialLineP: 400, specialLineH: 410,
    hot: ["港澳台联考", "会展旅游", "大湾区协同"],
    note: "澳门学生经保送/联考可报内地高校，横琴合作区为澳门青年提供了就业新空间。",
    industry: "会展、文旅、现代金融"
  }
};

window.PROVINCE_LIST = Object.keys(window.PROVINCES);
