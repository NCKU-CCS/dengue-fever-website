var express = require('express');
var router = express.Router();
var CONFIG = require('config');
var data = require(CONFIG.Controllers('data'));

// robots.txt
router.get('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send("User-agent: *\nDisallow: /");
});

router.get('/', function(req, res, next) {
  res.render('index', { title: '登革熱數據應用' });
});

router.get('/tainan-realtime-map', function(req, res, next) {
  res.render('tainan/tainan_realtime', { title: '台南即時登革熱資訊' });
});

router.get('/tainan-village-dengue-class', function(req, res, next) {
  res.render('tainan/tainan_village_class', { title: '台南村里疫別分類地圖' });
});

router.get('/tainan-detail-dynamic', function(req, res, next) {
  res.render('tainan/tainan_dynamic', { title: '台南熱區動態變化地圖-發病日' });
});

router.get('/tainan-dynamic-diagnose', function(req, res, next) {
  res.render('tainan/tainan_dynamic_diagnose', { title: '台南熱區動態變化地圖-確診日' });
});

router.get('/tainan-past-dengue', function(req, res, next) {
  res.render('tainan/past_tainan', { title: '歷年台南登革熱熱區變遷地圖' });
});


router.get('/drug-geo', function(req, res, next) {
  res.render('tainan/drug_geo', { title: '台南噴藥防治地圖' });
});

router.get('/dengue-drug', function(req, res, next) {
  res.render('tainan/dengue_drug', { title: '台南病例與噴藥動態變化地圖' });
});

router.get('/dengue-delay', function(req, res, next) {
  res.render('tainan/dengue_delay', { title: '台南登革熱-延遲就醫熱區地圖' });
});

router.get('/tainan-5-years', function(req, res, next) {
  res.render('tainan/tainan_5_years', { title: '台南登革熱-近五年病例' });
});

router.get('/tainan-small-region', function(req, res, next) {
  res.render('tainan/tainan_small_region', { title: '台南登革熱-最小統計區病例地圖' });
});

router.get('/tainan-serious-area', function(req, res, next) {
  res.render('tainan/tainan_serious_area', { title: '2015年全市登革熱－嚴重區域' });
});

router.get('/tainan-serious-area-village', function(req, res, next) {
  res.render('tainan/tainan_serious_area_village', { title: '2015年各里登革熱－最嚴重區域' });
});

router.get('/tainan-early-region-village', function(req, res, next) {
  res.render('tainan/tainan_early_region_village', { title: '2015年各里早期登革熱發病區域' });
});

router.get('/tainan-rain-rise-region', function(req, res, next) {
  res.render('tainan/tainan_rain_rise_region', { title: '2015年雨後病例明顯上升區域' });
});

router.get('/tainan-2015-inquire', function(req, res, next) {
  res.render('tainan/tainan_2015_inquire', { title: '依即時發病點反查2015年台南登革熱病例' });
});

router.get('/kao-village-dengue-class', function(req, res, next) {
  res.render('kaohsiung/kao_village_class', { title: '高雄村里疫別分類地圖' });
});

router.get('/kaohsiung-2015-dengue-2', function(req, res, next) {
  res.render('kaohsiung/2015_kaohsiung_2', { title: '2015年高雄即時登革熱地圖-發病日期' });
});

router.get('/kaohsiung-2014-dengue', function(req, res, next) {
  res.render('kaohsiung/2014_kaohsiung', { title: '2014年高雄登革熱熱區變遷地圖' });
});

router.get('/kaohsiung-past-dengue', function(req, res, next) {
  res.render('kaohsiung/past_kaohsiung', { title: '歷年高雄登革熱熱區變遷地圖' });
});

router.get('/kaohsiung-2015-dengue', function(req, res, next) {
  res.render('kaohsiung/2015_kaohsiung', { title: '2015年高雄登革熱熱區變遷地圖' });
});

router.get('/d/drug_geo', data.getDrugTopoJson);

module.exports = router;
