/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { YekSalai } from "../types";

// Raw production-grade Meitei clans dataset
const RAW_PRODUCTION_CLANS: Record<string, string[]> = {
  "Mangang": [
    "Aheibam", "Achuram", "Ahanthem", "Akhongbam", "Akhom", "Atom", "Ayekpam", "Chakamayum", "Chanam", "Chanambam", 
    "Chaninghanbam", "Chaningsenbam", "Charaimayum", "Charoibam", "Cherom", "Chingkham", "Chirom", "Chongjambam", 
    "Chonjhonbam", "Chongtham", "Choribam", "Chongthamningthom", "Hakwanthem", "Hawangthem", "Haodeibam", "Haodeijam", 
    "Haokhom", "Hayingthem", "Heibithabam", "Heirangkhongjam", "Heirangleisangbam", "Heirangthokcham", "Heirangthokchom", 
    "Heirom", "Heisnam", "Hemam", "Hemnam", "Hicham", "Hiringthem", "Hirom", "Hodam", "Hodamngatham", "Haobijam", 
    "Huirem", "Huidrom", "Huirongbam", "Huiyongbam", "Houbiyam", "Ikhoisangbam", "Ikwanthem", "Ipusangbam", 
    "Ipeisangbam", "Irengbam", "Irom", "Iromsinam", "Irumbam", "Irungbam", "Isenbam", "Kaisam", "Kambam", 
    "Kangabam", "Kangasangbam", "Kangsenbam", "Kanghujam", "Kayenpaibam", "Keisham", "Keithellakpam", "Keirensangbam", 
    "Khambam", "Khamnam", "Khanam", "Khamlangsangbam", "Khunjam", "Khunjham", "Khunjahanbam", "Khurailatpam", 
    "Khurirenbam", "Khundom", "Khundrakpam", "Khuriyenbam", "Khwairakpam", "Khidongbam", "Khoirom", "Khoisnam", 
    "Khoishnam", "Khoirujam", "Khoinudjam", "Khumanchaipam", "Khumankeirakpam", "Khumancharappam", "Khumanlambam", 
    "Khongnam", "Konsam", "Konuhaobam", "Konthahaobam", "Kongabam", "Kongbajam", "Kongacham", "Kongpam", 
    "Konbam", "Laichanbam", "Laikangbam", "Laisangbam", "Lamleirakpam", "Laitam", "Laitem", "Laitonjam", 
    "Lainram", "Langpoglakpam", "Langpoklangpam", "Langdem", "Lantham", "Leichoibam", "Leichonbam", "Leimaleirakpam", 
    "Leimapokpam", "Leimarakpam", "Leimasangbam", "Leimayokpam", "Leisongbam", "Leisonbam", "Liunungbam", 
    "Leiushungbam", "Leiyungshungbam", "Leiyungsungbam", "Lembam", "Loitam", "Loitongbam", "Loukrakpam", 
    "Lourangbam", "Lourembam", "Louriyam", "Loushambam", "Lousambam", "Lourungbam", "Lukram", "Mairanbam", 
    "Mairenbam", "Mayanglambam", "Mayum", "Moicham", "Moram", "Moibunglokpam", "Moirangningthoumayum", 
    "Mutum", "Nahakpam", "Nakambam", "Nameirakpam", "Namoijam", "Namoirakpam", "Nandeibam", "Naodam", 
    "Naokonsangbam", "Naorem", "Naoroibam", "Natham", "Nayanglambamutum", "Nayalamtum", "Ngangam", "Ngangom", 
    "Ngangkharungbam", "Ngangomyumdangbam", "Ngariyanbam", "Ngathem", "Ningthoujam", "Nongmaijam", "Nongmaujam", 
    "Nongthombam", "Nongthoujam", "Nongthoubam", "Nongmeikapam", "Noulam", "Noulem", "Numitleisangbam", 
    "Numitleimasangbam", "Paonam", "Ponam", "Paopam", "Pounam", "Pinam", "Pebam", "Pechimayum", "Pechimapam", 
    "Phairembam", "Phanjoubam", "Phamdom", "Phelem", "Phicham", "Phijam", "Phijaphibam", "Philem", "Phourungbam", 
    "Puthem", "Punam", "Poonum", "Saikhom", "Sairem", "Sapam", "Sanabam", "Sangaisenbam", "Sanagaisem", 
    "Sanglenbam", "Sanglem", "Sanrokpam", "Sanglelmayum", "Sangthokpam", "Sanoujam", "Sansabam", "Sansam", 
    "Sanasam", "Sanasabam", "Sansinbam", "Sanangaisem", "Sanawaibam", "Sanarokpam", "Sanwaibam", "Sagolhanjabam", 
    "Sagolhanjapam", "Sagolsem", "Senjam", "Seram", "Shamshinbam", "Sinam", "Singam", "Singgham", "Singkham", 
    "Singkhambam", "Singkhanbam", "Singkharam", "Singkhubam", "Soram", "Soyam", "Sorensangbam", "Soiram", 
    "Sougrakpam", "Sukham", "Suirem", "Taibungjham", "Taibungjam", "Taicham", "Takhellambam", "Tangeejam", 
    "Tangeijam", "Tayenjam", "Tayujam", "Tenshubam", "Tensubam", "Thingnam", "Thingyam", "Thangangshabam", 
    "Thangashabam", "Thangshabam", "Thanggabsanbam", "Thongabam", "Thongkapam", "Thongram", "Thongratabam", 
    "Thoudam", "Thounaojam", "Thengkapam", "Toibijam", "Toibisam", "Tonambam", "Tonbam", "Tonsembam", 
    "Thongrabam", "Urikhinbam", "Urikkhimbam", "Uripam", "Usham", "Waikhom", "Wairom", "Wairakpam", 
    "Wangkharakpam", "Wangkheilourungbam", "Wangkheimayum", "Wangkheiphamdokpam", "Wangkheiphamdonbam", 
    "Wangkheirakpam", "Warellambam", "Wareppam", "Warembam", "Yangambam", "Yangirakpam", "Yangjhrakpam", 
    "Yangouyeibam", "Yangouyenbam", "Yangnuyenbam", "Yangngambam", "Yangoubam", "Yaiskulakpam", "Yaiskullakpam", 
    "Yelam", "Yelem", "Yelwam", "Yenkokpam", "Yensenbam", "Yensembam", "Yenpokpam", "Yamkhaibam", "Yumkhaibam", 
    "Yumnam", "Yumnamkomsam", "Yumnamsorensangbam", "Yumnamkonsam", "Yengkhom"
  ],
  "Luwang": [
    "Abujam", "Achoibam", "Angambam", "Arambam", "Arekpam", "Arubam", "Asangbam", "Asangwangbam", "Athokpam", 
    "Ayekpam", "Chingaibam", "Chinggaibam", "Chingjabam", "Chongjabam", "Chongtham", "Haikham", "Haorongbam", 
    "Heikam", "Heikham", "Heitham", "Hijam", "Hinaosabam", "Hingkhaibam", "Hingkhangbam", "Huirongbam", 
    "Ichom", "Kambongmayum", "Khemjam", "Khoibam", "Khoknam", "Khugam", "Khujammayum", "Khumukcham", "Khunjam", 
    "Koijam", "Kongpacham", "Laikangbam", "Laikhonglembam", "Lairenjam", "Lairoijam", "Lairongjam", "Laisom", 
    "Lakpamsabam", "Leirongjam", "Longkhumukcham", "Lorengbam", "Lorongbam", "Loukham", "Loukhambam", 
    "Loungambam", "Loupam", "Lukhram", "Lusangbam", "Luwangsangbam", "Maibunglokpam", "Mainam", "Maisnam", 
    "Mayengbam", "Meikam", "Meisnam", "Meitram", "Metram", "Nahakpam", "Nambam", "Nanbam", "Naoroibam", 
    "Naoroijam", "Nganglom", "Ngangom", "Ngoubam", "Ningachikpam", "Ningchitpam", "Ningngakchikpam", 
    "Nongpokpam", "Nongthombam", "Pambihanbam", "Phairaijam", "Phamihanbam", "Phampibam", "Pheiroijam", 
    "Pungkraijam", "Sakakpam", "Sakokpam", "Salam", "Salamhaorongbam", "Sambakram", "Sambangsam", "Sambrandram", 
    "Sembangjam", "Senjam", "Shithangkham", "Singkhaibam", "Soram", "Soubam", "Souram", "Takhellambam", 
    "Takhelmayum", "Thamangbam", "Thamangcham", "Thanangcham", "Thangjam", "Thangjamkhumukcham", "Thangjamsoram", 
    "Thaoroijam", "Thaoteibam", "Thaoteijam", "Thiram", "Thiyam", "Thonaojam", "Thoudam", "Thounaojam", 
    "Tinbijam", "Toibijam", "Toijam", "Toijham", "Toumom", "Tourem", "Urepkhinbam", "Usham", "Wahengbam", 
    "Waikhom", "Wakonthem", "Wakonthemwakongthem", "Wangjam", "Wanglelbam", "Wanglempam", "Wanglenbam", 
    "Yangambam", "Yangkampam", "Yangkokpam", "Yangkopam", "Yangngambam", "Yelangbam", "Yendrembam", 
    "Yoirelkbam", "Yumlembam"
  ],
  "Khuman": [
    "Ahabam", "Ahaibam", "Aheibam", "Aheibamtaobam", "Ahongbam", "Ahongsangbam", "Akangbam", "Akangjam", "Akaram", 
    "Akham", "Akhom", "Akhuwam", "Akuwam", "Amakcham", "Amom", "Angudam", "Aphram", "Aseibahanbam", "Asem", 
    "Atenbam", "Atom", "Atomsinam", "Ayam", "Chabungbam", "Chandam", "Changngammayum", "Charoibam", "Chingkham", 
    "Chingkhom", "Chingkhubam", "Chingtham", "Chongkham", "Chongmom", "Chongtham", "Chungkham", "Hanglem", 
    "Haobam", "Haobijam", "Haoibam", "Haorongbam", "Haorungbam", "Haowoibam", "Hatrongbam", "Hawaibam", 
    "Heikrujam", "Heiram", "Hentakpam", "Henthakpam", "Hikhom", "Howaibam", "Inabam", "Inbem", "Inglaibam", 
    "Inglem", "Ingudam", "Inguibam", "Inguidam", "Insebam", "Intonbam", "Ipusangbam", "Jhanabam", "Kabaobam", 
    "Kaborungbam", "Kabrambam", "Kabrebambam", "Kabrembam", "Kadam", "Kanam", "Kangjam", "Kanjem", "Karam", 
    "Karaobam", "Kawam", "Khamnam", "Khudeibam", "Khunthaibam", "Khuyokanthem", "Kiram", "Khoirangbam", 
    "Khoirom", "Khoisumbam", "Khoisungbam", "Khongbantabam", "Khongkhumakcham", "Khubam", "Khulem", "Khumanthem", 
    "Khumbam", "Khundabam", "Khundaibam", "Khundeibam", "Khuntheibam", "Khutheibam", "Kolom", "Laikhram", 
    "Laikhuram", "Laipukhram", "Laishram", "Lakhom", "Lamabam", "Lambam", "Lampham", "Lamtom", "Langdem", 
    "Langgam", "Langheibam", "Langkham", "Langkhombam", "Langkhomgbam", "Langkhuram", "Langlenhanabam", 
    "Langlenhanbam", "Langlenhannabam", "Lankam", "Lantem", "Leisangthem", "Likmabam", "Likmaijam", "Limabam", 
    "Loijayangbam", "Longkhumakcham", "Maibam", "Maibram", "Maikhuram", "Maikuram", "Maiphaam", "Maipham", 
    "Maimam", "Maimom", "Mainom", "Maiphuram", "Mairengbam", "Mayanglambam", "Meinam", "Meipharam", "Meiphubam", 
    "Meiphuwam", "Meitangkeisangbam", "Mepram", "Moichem", "Moijam", "Moirengbam", "Moirengjam", "Moiyanglangbam", 
    "Mongbijam", "Mongjam", "Mongphijam", "Mukhom", "Nabam", "Namaram", "Namram", "Nambam", "Nanbam", 
    "Nansenbam", "Nebram", "Nepram", "Ngaikhebam", "Ngangbam", "Ngasepam", "Ngaseppam", "Ningthoukapam", 
    "Ningthoukappam", "Oinam", "Oinamsendusangbam", "Pallambam", "Pallembam", "Palpubam", "Palujam", 
    "Pangambam", "Pangeijam", "Pangkheijam", "Pangkhoijam", "Pangkhaijam", "Pangoijam", "Pankhaibam", 
    "Pankhaijam", "Panujam", "Phairelpam", "Phairenbam", "Phairenjam", "Phaiyenjam", "Phancham", "Phanjem", 
    "Pharenbam", "Polembam", "Pongsangbam", "Posangbam", "Pukhram", "Pukhrambam", "Puklapam", "Pukrem", 
    "Puyam", "Sagappam", "Sagulpam", "Sakappam", "Sakatpam", "Sakokpam", "Sakopam", "Sakpam", "Samom", 
    "Samukcham", "Sandam", "Sandham", "Sandongjam", "Sangkhom", "Sanjenbam", "Sankham", "Sankhom", "Sansenbam", 
    "Santham", "Sapam", "Senam", "Sendam", "Sentam", "Shandham", "Sinam", "Siyatpam", "Sogaisam", "Sogaijam", 
    "Soram", "Soukaijam", "Souram", "Taibajam", "Taibangjam", "Taibungjam", "Taidangjam", "Taipojam", 
    "Taipongjam", "Tajam", "Taobam", "Taojam", "Taomom", "Taopam", "Taopom", "Taorambam", "Taorem", 
    "Tenbam", "Tenkhaibam", "Tenthainabam", "Terem", "Thangatsabahanglem", "Thanggangsabahangbam", "Thangjam", 
    "Thangram", "Thaodem", "Thengujam", "Thidom", "Thidujam", "Thingbajam", "Thingbaijam", "Thingom", 
    "Thingujam", "Thoidingbam", "Thoidingjam", "Thoidringbam", "Thongam", "Thongbam", "Thongcham", "Thonganam", 
    "Thongram", "Thongtham", "Thoudam", "Thoudem", "Thumganbam", "Tilem", "Tokpam", "Tokram", "Tongkhram", 
    "Tongkhramtoumom", "Tonjam", "Tonjum", "Tonkhram", "Tonthram", "Toukhom", "Wakom", "Wanggom", "Wangkhem", 
    "Wangyellambam", "Wareppam", "Wayellambam", "Wayengbam", "Yaikhibam", "Yaithingbam", "Yakadum", "Yambem", 
    "Yangleibam", "Yanglem", "Yanguyeibam", "Yathibam", "Yentakpam", "Yenthakpam", "Yerenjam", "Yukadum", 
    "Yumkham", "Yurenjam"
  ],
  "Angom": [
    "Achoibam", "Achom", "Achoubam", "Achubam", "Achuram", "Akanbam", "Akhanbam", "Akoijam", "Angom", "Angomjambam", 
    "Angomyumkhaibam", "Angonjam", "Apangmayum", "Asheibam", "Ayekpam", "Ayenbam", "Ayengbam", "Chakpram", 
    "Champram", "Chingangbam", "Chingshubam", "Chingsubam", "Haheibam", "Haibam", "Heikrambam", "Heikrenbam", 
    "Heiram", "Heirem", "Heiwam", "Herom", "Hidam", "Hikhambam", "Hitam", "Honglensubam", "Hongnemsumbam", 
    "Ikheisangbam", "Ikhoisangbam", "Ikudam", "Kaikom", "Kaikonbam", "Kaikombam", "Kambam", "Kanbam", 
    "Kangthem", "Kasnam", "Kasubam", "Keikombam", "Keikrenbam", "Keisam", "Khachenbam", "Khanachaobam", 
    "Khangembam", "Khangenbam", "Kharibam", "Kheknam", "Khekram", "Khoibam", "Khoimomtabam", "Khoipam", 
    "Khoirangbam", "Khokrom", "Khomongmayum", "Khongyangbam", "Khukyonthem", "Khumbongmayum", "Khumganbam", 
    "Khungyouthem", "Khutyokanthem", "Khutyonthem", "Khuyumthem", "Kikrubam", "Kiram", "Kiyam", "Kongbam", 
    "Kshetrimayum", "Lairellakpam", "Lairenlakpam", "Laitonjam", "Langmaithem", "Leitanthem", "Longjam", 
    "Longmaithem", "Louriyanbam", "Mambam", "Mandingbam", "Mangsatabam", "Mangsatam", "Mangshidam", 
    "Moirangleisangbam", "Moiranglaisangbam", "Mongsatabam", "Monphangmayum", "Mophangmayum", "Mukhom", 
    "Mungkhom", "Mutkhom", "Nakpokhanjabam", "Napakkhanbam", "Napakhanbam", "Nandeibam", "Narumbam", 
    "Narungbam", "Narunmbam", "Ngalenbam", "Ngamukcham", "Nganglembam", "Nganglengbam", "Nganukappam", 
    "Ngarenbam", "Ngarengbam", "Ngayenbam", "Ningombam", "Ningthoubam", "Nongmaithem", "Nongpokhanjabam", 
    "Oinam", "Ongnam", "Patchahanbam", "Phuritsabam", "Pongsumbam", "Posambam", "Posambamputonjam", 
    "Potsangbam", "Pungtojam", "Putonjam", "Sairem", "Sambuduram", "Sangam", "Sangambam", "Sangdonjam", 
    "Sangombam", "Sarom", "Saromkeikapam", "Sendangmayum", "Senjam", "Seram", "Seramheikrujam", "Shambanduram", 
    "Shangsatam", "Shangshatam", "Telem", "Thumganbam", "Thunganbam", "Usam", "Usham", "Waheibam", "Wakom", 
    "Wanggoibam", "Wangkhem", "Wangoibam", "Wathem", "Yangoijam", "Yumkhaibam", "Yumlembam"
  ],
  "Moirang": [
    "Achom", "Ahaibam", "Aheibam", "Aiekhom", "Akaram", "Akhuibam", "Akhuram", "Akhwaibam", "Akuram", "Asem", 
    "Chakpakiyam", "Chakpatabam", "Chongtham", "Elangbam", "Hitam", "Iurenbam", "Kabajam", "Kaborambam", 
    "Kabrajam", "Kapam", "Keithellakpam", "Khaithenlakpam", "Khoibam", "Khoinaijam", "Khoipudrabam", 
    "Khoipudram", "Khomdram", "Khompudram", "Khondram", "Khondrom", "Khoyingbam", "Khuirakpam", "Koilelcham", 
    "Koilencham", "Koilenjam", "Koirencham", "Koirenjam", "Kokham", "Kongkham", "Kongkhubam", "Kongkhuram", 
    "Konjenggbam", "Kubabam", "Kumabam", "Kumam", "Laichujam", "Laikhujam", "Laikhurum", "Laimom", "Laimujam", 
    "Laiphrakpam", "Laiphuram", "Laipujam", "Lairelmayum", "Lairenmayum", "Laithangbam", "Lambaijam", 
    "Lambajam", "Lambujam", "Lampujam", "Laomom", "Leilakpam", "Leilalakpam", "Leimacham", "Leimajam", 
    "Leimakhujam", "Leyuijam", "Leyujam", "Lisam", "Ludonjam", "Maiphujam", "Maiphuram", "Mairenbam", 
    "Maiyanglambam", "Mangkhom", "Melem", "Moibam", "Moibampukhrambam", "Moirangchongthang", 
    "Moirangkeithellakpam", "Moirangmayum", "Moirangmom", "Moirangnarengbam", "Moirangnongthongbam", 
    "Moirangthem", "Moirangthongbam", "Moirangyangmom", "Moirangyumkhaibam", "Monkum", "Monkuwam", 
    "Moyongbam", "Mungyangjam", "Murangbam", "Mutum", "Muyangbam", "Nambujam", "Namujam", "Narengbam", 
    "Nayengbam", "Ngangchengbam", "Ngangchongbam", "Ngangkham", "Ngangnembam", "Ngangnenbam", "Ngangnom", 
    "Ngangom", "Ngangthem", "Ngasam", "Ningthoukhom", "Ningthoukhongbam", "Ningthoukhongjam", "Nungleppam", 
    "Nunglepam", "Okram", "Phaikhom", "Polem", "Pukhrambam", "Pukhranbampukhranbam", "Pukkhulpam", 
    "Pukrambam", "Pukhulpam", "Sanasam", "Sankhom", "Senkhom", "Sensam", "Soibam", "Soibampukhrambam", 
    "Thangajam", "Thangjam", "Thangjamankhom", "Thangjammangkhom", "Thangjamsangkhom", "Thokchom", 
    "Thongajam", "Thongjam", "Toupokcham", "Waibam", "Wainabam", "Wairam", "Wakabam", "Wakalpam", "Wakambam", 
    "Wanbijam", "Wangbijam", "Wangkhem", "Wanglembam", "Wangpijam", "Warembam", "Wareppam", "Wayelbam", 
    "Wayengbam", "Wayinbam", "Yaikhom", "Yaokhom", "Yurembam"
  ],
  "Khaba Nganba": [
    "Aheibam", "Aheibamthongam", "Chengleijam", "Haobijam", "Hekngakpam", "Hengakpam", "Hentakpam", "Iwangbam", 
    "Kabrambam", "Kakemsangbam", "Khaidem", "Khathangbam", "Khudongbam", "Khundongbam", "Khumjam", "Khumujam", 
    "Khumukcham", "Khuraijam", "Khuwaijam", "Konchapam", "Konchopam", "Konheibam", "Konjengbam", "Konthoucham", 
    "Konthoujam", "Langoljam", "Langonjam", "Mahoubam", "Maihoubam", "Mantangbam", "Meihoubam", "Melangbam", 
    "Merimayum", "Morimayum", "Ngakpam", "Ngathem", "Nongchenbam", "Nongjenbam", "Phidam", "Phijamtekcham", 
    "Samjetsabam", "Sangambam", "Sangngambam", "Sanjibam", "Sanjiram", "Tekcham", "Thinbam", "Thingbam", 
    "Thingbaijam", "Thongam", "Thongngam", "Thourikhum", "Thourikhun", "Wakemsangbam", "Wakonsangbam", 
    "Wangbajam", "Wangbijam", "Wangkoncham", "Yelangbam", "Yenglangbam"
  ],
  "Salang Leisangthem": [
    "Amom", "Amomaheibam", "Chanam", "Changtham", "Chengleibam", "Chingakham", "Chingkham", "Chingleipam", 
    "Choleipam", "Elangbam", "Gonganbam", "Gouganbam", "Haibam", "Haiwam", "Haorokcham", "Heibam", 
    "Heimoibam", "Hemnam", "Hemoisam", "Huirem", "Huiram", "Huiyam", "Engkhampam", "Ingkutam", "Ingkutm", 
    "Ingudam", "Kaorokcham", "Keidasoibam", "Khagokbam", "Khagokpam", "Kharaijam", "Khoicham", "Khoichem", 
    "Khoinam", "Khoirom", "Khoisnam", "Khoriyembam", "Khoriyemgbam", "Khoriyengbam", "Khundongbam", 
    "Khuntongbam", "Khurachatengkhanpa", "Khurachatengkhanpam", "Khuraicham", "Khuraijam", "Khuriyenbam", 
    "Konjengbam", "Konsam", "Konthoujam", "Konthoujammeinam", "Langonjam", "Langoijam", "Leishangthem", 
    "Leisangthem", "Leitam", "Loktongbam", "Longgonjam", "Loushigam", "Lousigam", "Maibathijam", "Maibathiram", 
    "Maibathiyam", "Maibrabam", "Mairambam", "Mairembam", "Mayanglambam", "Mayanglamgbam", "Meinam", "Moinam", 
    "Naorem", "Naosekpam", "Naoshram", "Ngakhem", "Ngamukcham", "Nganukappam", "Ngathem", "Noshram", 
    "Pheidasoibam", "Potsangbam", "Potshangbam", "Saisem", "Samnam", "Samnoipam", "Samom", "Sangkhubam", 
    "Sarangthem", "Sarokhaibam", "Sarokkhaibam", "Shoraisham", "Sombam", "Sombem", "Soraisam", "Sorokhaibam", 
    "Suraisem", "Tengkhampam", "Thangjam", "Thangjamayumpubam", "Thangjamyumpubam", "Thongbram", "Thouganbam", 
    "Thumkanbam", "Tongbram", "Toubangbam", "Tourangbam", "Wairakpam", "Wairokpam", "Yanggoijam", "Yagoijam", 
    "Yumgudam", "Yumgudum", "Yumpubam", "Yumpumbam", "Yumshadum", "Yumshudum"
  ]
};

// Map raw string based clan keys to modern app's strict YekSalai types
const YEK_KEY_MAP: Record<string, YekSalai> = {
  "Mangang": "Mangang",
  "Luwang": "Luwang",
  "Khuman": "Khuman",
  "Angom": "Angom",
  "Moirang": "Moirang",
  "Khaba Nganba": "Kha-Nganba",
  "Salang Leisangthem": "Chenglei"
};

// Parse and reconstruct into a clean yumnakDatabase structured as Record<string, YekSalai[]>
const buildProductionDatabase = (): Record<string, YekSalai[]> => {
  const merged: Record<string, YekSalai[]> = {};

  // Loop through raw datasets
  Object.entries(RAW_PRODUCTION_CLANS).forEach(([rawClanKey, surnames]) => {
    const yekSalai = YEK_KEY_MAP[rawClanKey];
    if (!yekSalai) return;

    surnames.forEach((rawSurname) => {
      const surname = rawSurname.trim();
      if (!merged[surname]) {
        merged[surname] = [];
      }
      if (!merged[surname].includes(yekSalai)) {
        merged[surname].push(yekSalai);
      }
    });
  });

  // Guarantee additional rare exceptions (like target exceptions) are covered beautifully
  const additionalExceptions: Record<string, YekSalai[]> = {
    "Laishram": ["Khuman", "Mangang"], // Added Luwang/Mangang combinations
    "Mungyamcham": ["Mangang"],
    "Lairencham": ["Mangang"],
    "Lairenjam": ["Mangang", "Luwang"],
    "Kanghujam": ["Mangang"],
    "Thokchom": ["Moirang"],
    "Moirangmayum": ["Moirang"],
    "Lairenmayum": ["Moirang"],
    "Lombam": ["Moirang"],
    "Angomjambam": ["Angom"],
    "Sarangthem": ["Chenglei"],
    "Chabungbam": ["Chenglei", "Khuman"],
    "Haorokcham": ["Chenglei"],
    "Haorokjam": ["Chenglei"],
    "Konthoucham": ["Chenglei"],
    "Konthoujam": ["Chenglei", "Salang Leisangthem" as any], // Clean mapping fallback
    "Amakcham": ["Chenglei", "Khuman"],
    "Achom": ["Kha-Nganba", "Moirang", "Angom"],
    "Hidam": ["Angom"],
    "Langmaithem": ["Luwang", "Angom"],
    "Salam": ["Chenglei", "Moirang", "Luwang"],
    "Chanu": ["Moirang"]
  };

  Object.entries(additionalExceptions).forEach(([surname, clans]) => {
    if (!merged[surname]) {
      merged[surname] = [];
    }
    clans.forEach((clan) => {
      // Standardize clan naming
      let normalizedClan: YekSalai = clan;
      if ((clan as string) === "Salang Leisangthem") {
        normalizedClan = "Chenglei";
      }
      if (!merged[surname].includes(normalizedClan)) {
        merged[surname].push(normalizedClan);
      }
    });
  });

  return merged;
};

// Export the compiled production database
export const yumnakDatabase: Record<string, YekSalai[]> = buildProductionDatabase();
