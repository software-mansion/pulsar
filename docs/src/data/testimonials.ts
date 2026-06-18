export type Testimonial = {
  source: 'x' | 'reddit';
  link: string;
  author: string;
  handle: string;
  body: string;
  avatar?: string;
};

const x = (
  name: string,
  handle: string,
  avatar: string | undefined,
  link: string,
  body: string
): Testimonial => ({
  source: 'x',
  link,
  author: name,
  handle: `@${handle}`,
  body,
  avatar,
});

const reddit = (
  username: string,
  subreddit: string,
  avatar: string | undefined,
  link: string,
  body: string
): Testimonial => ({
  source: 'reddit',
  link,
  author: username,
  handle: `r/${subreddit}`,
  body,
  avatar,
});

export const leftColumn: Testimonial[] = [
  x(
    'Yusuff Smart',
    'yusuff_again',
    'https://pbs.twimg.com/profile_images/2001702913383534592/TW00cBeA_400x400.jpg',
    'https://x.com/yusuff_again/status/2042310735699533935',
    'This is an absolute game changer for mobile UX! 150+ haptic patterns ready to go is such a huge time saver. Amazing work by the Software Mansion team!'
  ),
  reddit(
    'anchorbabi',
    'iOSProgramming',
    'https://i.redd.it/snoovatar/avatars/14bbfc47-9b86-4250-9541-ac6f0ce8c041.png',
    'https://www.reddit.com/r/iOSProgramming/comments/1shp16n/comment/ofg8gz3/',
    'This is really comprehensive and useful. Thank you for sharing.'
  ),
  x(
    'Zach',
    'mrzachnugent',
    'https://pbs.twimg.com/profile_images/1889621620404174848/uPNLB3X3_400x400.jpg',
    'https://x.com/mrzachnugent/status/2042376872634261917',
    'The accelerometer haptics are so good!!'
  ),
  x(
    'Mr D.J.',
    'MrDJ2U26',
    'https://pbs.twimg.com/profile_images/1998837860783321088/VyiskP5I_400x400.jpg',
    'https://x.com/MrDJ2U26/status/2042326441648390519',
    'Do y’all just not sleep? I swear y’all are pumping stuff out like crazy and it’s all awesome.'
  ),
  x(
    'Dino',
    'dino11',
    'https://pbs.twimg.com/profile_images/1981633799331930112/sz1ZFPb8_400x400.jpg',
    'https://x.com/dino11/status/2042271914148729196',
    'oh this is sick, been looking for something exactly like this — the audio preview for simulator testing is genius'
  ),
  x(
    'Volodymyr',
    'v_serbulenko',
    'https://pbs.twimg.com/profile_images/1901218639870930944/cOUwIJLh_400x400.jpg',
    'https://x.com/v_serbulenko/status/2042272701927104770',
    'Amazing 🫶 Just tried the app, it’s so engaging'
  ),
  reddit(
    'alexmaster248',
    'reactnative',
    'https://i.redd.it/snoovatar/avatars/05b2f351-a580-4b3b-b91a-765160e2a96f.png',
    'https://www.reddit.com/r/reactnative/comments/1sgsg09/comment/of7nkrt/',
    "You know it's gonna be a fire package if it's by software mansion!"
  ),
  x(
    'Jhan',
    'jhanui_',
    'https://pbs.twimg.com/profile_images/2041640382128074752/I3uoY4EQ_400x400.jpg',
    'https://x.com/jhanui_/status/2042283007982072040',
    'Amazing'
  ),
  x(
    'Yahia',
    'Yahiaxb',
    'https://pbs.twimg.com/profile_images/1969059014668607488/9j6oyTz4_400x400.jpg',
    'https://x.com/Yahiaxb/status/2042258793552290291',
    'Hats off as always'
  ),
];

export const middleColumn: Testimonial[] = [
  x(
    'Pierre Caporossi',
    'PierreCaporossi',
    'https://pbs.twimg.com/profile_images/1751732781808332800/x-8Yq42n_400x400.jpg',
    'https://x.com/PierreCaporossi/status/2042260450696479105',
    'Some may think it’s niche but what an awesome library. Phone-to-website connection = great DX. The presets alone are incredibly valuable. I am definitely shipping Pulsar in prod next week within my app!'
  ),
  x(
    'Edwardooo',
    'ouroborobo',
    'https://pbs.twimg.com/profile_images/1678989721039667201/WJ-vsquG_400x400.jpg',
    'https://x.com/ouroborobo/status/2042436097750229331',
    'godsend. I was thinking about adding haptic to all of these. And this lib with iPhone to trying out all the combo and making your own are gold!'
  ),
  reddit(
    'AdProfessional7333',
    'iOSProgramming',
    'https://styles.redditmedia.com/t5_53yx52/styles/profileIcon_uazw8xq9vqug1.jpg',
    'https://www.reddit.com/r/iOSProgramming/comments/1shp16n/comment/og5mgjb/',
    'The audio preview in the browser is a nice touch. Way easier to shop for a feel before wiring anything up in Xcode.'
  ),
  x(
    'Shubh Porwal',
    'shubhporwal24',
    'https://pbs.twimg.com/profile_images/1907504180006199296/2d7ocZlc_400x400.jpg',
    'https://x.com/shubhporwal24/status/2042284740514885824',
    'trying this on my phone was such a cool experience. had no idea haptics could feel this good'
  ),
  x(
    'Hewad Mubariz',
    'hewad_mubariz',
    'https://pbs.twimg.com/profile_images/1617626478920736768/3W9WIVzc_400x400.jpg',
    'https://x.com/hewad_mubariz/status/2042586415968452840',
    'Amazing Job 👏 Too many options for haptics finally'
  ),
  reddit(
    'ponk___',
    'reactnative',
    'https://i.redd.it/snoovatar/avatars/ef788e1d-4764-48d6-bdf8-144065d7762c.png',
    'https://www.reddit.com/r/reactnative/comments/1sgsg09/comment/ofc3k4n/',
    'SWM please slow down I can’t keep up with how much bangers you release'
  ),
  x(
    'Daehyeon 대현',
    'DaehyeonMun',
    'https://pbs.twimg.com/profile_images/1959306129625997312/N28-_KhZ_400x400.jpg',
    'https://x.com/DaehyeonMun/status/2042266414216831137',
    "I can't live without Software Mansion"
  ),
  x(
    'Bartosz Grajdek',
    'BartoszGrajdek',
    'https://pbs.twimg.com/profile_images/2029551787364261888/jMKSqGOW_400x400.jpg',
    'https://x.com/BartoszGrajdek/status/2042917712284860827',
    'Really excited to try this one!'
  ),
  reddit(
    'Ill-Living5406',
    'iOSProgramming',
    'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_5.png',
    'https://www.reddit.com/r/iOSProgramming/comments/1shp16n/comment/og2obsv/',
    'What a great idea and so very well executed. Thanks for creating this!'
  ),
];

export const rightColumn: Testimonial[] = [
  x(
    'Edwardooo',
    'ouroborobo',
    'https://pbs.twimg.com/profile_images/1678989721039667201/WJ-vsquG_400x400.jpg',
    'https://x.com/ouroborobo/status/2042437835974721975',
    'The haptic felt 1000% better on a actual device too. Incredible lib.'
  ),
  reddit(
    'tdavilas',
    'androiddev',
    'https://i.redd.it/snoovatar/avatars/41df0c7a-474d-484a-b78e-17cb57a00553.png',
    'https://www.reddit.com/r/androiddev/comments/1shoq0o/comment/ofeinae',
    'I think this is a cool project. Even if its made partially with AI, it shows that you really enjoy the UX aspect of mobile development which I appreciate a lot. Good work! :D'
  ),
  x(
    'Constant Lahousse',
    'constantlhe',
    'https://pbs.twimg.com/profile_images/1674512749928370179/S0Dq9-ER_400x400.jpg',
    'https://x.com/constantlhe/status/2042265109033111773',
    'This is awesome 🙌'
  ),
  x(
    'Meltohamy 𓂆',
    'm090009',
    'https://pbs.twimg.com/profile_images/1926012601093275648/m7_Q7fKj_400x400.jpg',
    'https://x.com/m090009/status/2042255893111374190',
    "There's one for Android too, you guys are awesome"
  ),
  reddit(
    'sans-connaissance',
    'iOSProgramming',
    'https://i.redd.it/snoovatar/avatars/351dc45e-2b95-4ad2-a1b8-aa18710de2c0.png',
    'https://www.reddit.com/r/iOSProgramming/comments/1shp16n/comment/offi096/',
    'I downloaded the app and connected. I’m enjoying trying these out, thanks for putting it together!'
  ),
  x(
    'Charles Vinette',
    'Charlesvinette',
    'https://pbs.twimg.com/profile_images/1948373949722636288/NgCw7OMI_400x400.jpg',
    'https://x.com/Charlesvinette/status/2042269506072973721',
    'the docs website looks great!'
  ),
  reddit(
    'Chance-Egg-4543',
    'reactnative',
    'https://i.redd.it/snoovatar/avatars/ebf03a5a-c57c-4830-b618-1c013aa31f5d.png',
    'https://www.reddit.com/r/reactnative/comments/1sgsg09/comment/of9gz3f/',
    'Just checked it out. Im left in awe!'
  ),
  x(
    'Carrick',
    'carrickkv2',
    'https://pbs.twimg.com/profile_images/965449860542590978/UpwF4LTd_400x400.jpg',
    'https://x.com/carrickkv2/status/2042263286612152552',
    'This is awesome'
  ),
  x(
    'Clem ent',
    'clement___10',
    'https://pbs.twimg.com/profile_images/2057349147989078016/uiIceaTX_400x400.jpg',
    'https://x.com/clement___10/status/2042570012301390177',
    'banger'
  ),
];
