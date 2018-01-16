// ==UserScript==
// @name         Statistics
// @namespace    http://tampermonkey.net/
// @version      3.0.2
// @description  Shows EyeWire Statistics
// @author       Krzysztof Kruk
// @match        https://*.eyewire.org/*
// @exclude      https://*.eyewire.org/1.0/*
// @downloadURL  https://raw.githubusercontent.com/ChrisRaven/EyeWire-Statistics/master/statistics.user.js
// @grant        GM_xmlhttpRequest
// @connect      ewstats.feedia.co
// @require      https://chrisraven.github.io/EyeWire-Statistics/jquery-jvectormap-2.0.3.min.js
// @require      https://chrisraven.github.io/EyeWire-Statistics/jquery-jvectormap-world-mill.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.6.0/Chart.min.js
// ==/UserScript==

/*jshint esversion: 6 */
/*globals $, GM_xmlhttpRequest, Chart */

var LOCAL = false;
if (LOCAL) {
  console.log('%c--== TURN OFF "LOCAL" BEFORE RELEASING!!! ==--', "color: red; font-style: italic; font-weight: bold;");
}


// source: https://eyewire.org/1.0/countries/
const countries = {"af":"Afghanistan","ax":"Aland Islands","al":"Albania","dz":"Algeria","as":"American Samoa","ad":"Andorra","ao":"Angola","ai":"Anguilla","aq":"Antarctica","ag":"Antigua and Barbuda","ar":"Argentina","am":"Armenia","aw":"Aruba","au":"Australia","at":"Austria","az":"Azerbaijan","bs":"Bahamas","bh":"Bahrain","bd":"Bangladesh","bb":"Barbados","by":"Belarus","be":"Belgium","bz":"Belize","bj":"Benin","bm":"Bermuda","bt":"Bhutan","bo":"Bolivia","bq":"Bonaire, Saint Eustatius and Saba","ba":"Bosnia and Herzegovina","bw":"Botswana","br":"Brazil","io":"British Indian Ocean Territory","bn":"Brunei Darussalam","bg":"Bulgaria","bf":"Burkina Faso","bi":"Burundi","kh":"Cambodia","cm":"Cameroon","ca":"Canada","cv":"Cape Verde","ky":"Cayman Islands","cf":"Central African Republic","td":"Chad","cl":"Chile","cn":"China","cx":"Christmas Island","cc":"Cocos (Keeling) Islands","co":"Colombia","km":"Comoros","cg":"Congo","cd":"Congo, The Democratic Republic of the","ck":"Cook Islands","cr":"Costa Rica","ci":"Cote D'Ivoire","hr":"Croatia","cu":"Cuba","cw":"Curacao","cy":"Cyprus","cz":"Czech Republic","dk":"Denmark","dj":"Djibouti","dm":"Dominica","do":"Dominican Republic","ec":"Ecuador","eg":"Egypt","sv":"El Salvador","gq":"Equatorial Guinea","er":"Eritrea","ee":"Estonia","et":"Ethiopia","eu":"Europe","hq":"EyeWire HQ","fk":"Falkland Islands (Malvinas)","fo":"Faroe Islands","fj":"Fiji","fi":"Finland","fr":"France","gf":"French Guiana","pf":"French Polynesia","tf":"French Southern Territories","ga":"Gabon","gm":"Gambia","ge":"Georgia","de":"Germany","gh":"Ghana","gi":"Gibraltar","gr":"Greece","gl":"Greenland","gd":"Grenada","gp":"Guadeloupe","gu":"Guam","gt":"Guatemala","gg":"Guernsey","gn":"Guinea","gw":"Guinea-Bissau","gy":"Guyana","ht":"Haiti","va":"Holy See (Vatican City State)","hn":"Honduras","hk":"Hong Kong","hu":"Hungary","is":"Iceland","in":"India","id":"Indonesia","ir":"Iran, Islamic Republic of","iq":"Iraq","ie":"Ireland","im":"Isle of Man","il":"Israel","it":"Italy","jm":"Jamaica","jp":"Japan","je":"Jersey","jo":"Jordan","kz":"Kazakhstan","ke":"Kenya","ki":"Kiribati","kp":"Korea, Democratic People's Republic of","kr":"Korea, Republic of","kw":"Kuwait","kg":"Kyrgyzstan","la":"Lao People's Democratic Republic","lv":"Latvia","lb":"Lebanon","ls":"Lesotho","lr":"Liberia","ly":"Libya","li":"Liechtenstein","lt":"Lithuania","lu":"Luxembourg","mo":"Macau","mk":"Macedonia","mg":"Madagascar","mw":"Malawi","my":"Malaysia","mv":"Maldives","ml":"Mali","mt":"Malta","mh":"Marshall Islands","mq":"Martinique","mr":"Mauritania","mu":"Mauritius","yt":"Mayotte","mx":"Mexico","fm":"Micronesia, Federated States of","md":"Moldova, Republic of","mc":"Monaco","mn":"Mongolia","me":"Montenegro","ms":"Montserrat","ma":"Morocco","mz":"Mozambique","mm":"Myanmar","na":"Namibia","nr":"Nauru","np":"Nepal","nl":"Netherlands","nc":"New Caledonia","nz":"New Zealand","ni":"Nicaragua","ne":"Niger","ng":"Nigeria","nu":"Niue","nf":"Norfolk Island","mp":"Northern Mariana Islands","no":"Norway","om":"Oman","pk":"Pakistan","pw":"Palau","ps":"Palestinian Territory","pa":"Panama","pg":"Papua New Guinea","py":"Paraguay","pe":"Peru","ph":"Philippines","pn":"Pitcairn Islands","pl":"Poland","pt":"Portugal","pr":"Puerto Rico","qa":"Qatar","re":"Reunion","ro":"Romania","ru":"Russian Federation","rw":"Rwanda","bl":"Saint Barthelemy","sh":"Saint Helena","kn":"Saint Kitts and Nevis","lc":"Saint Lucia","mf":"Saint Martin","pm":"Saint Pierre and Miquelon","vc":"Saint Vincent and the Grenadines","ws":"Samoa","sm":"San Marino","st":"Sao Tome and Principe","sa":"Saudi Arabia","sn":"Senegal","rs":"Serbia","sc":"Seychelles","sl":"Sierra Leone","sg":"Singapore","sx":"Sint Maarten (Dutch part)","sk":"Slovakia","si":"Slovenia","sb":"Solomon Islands","so":"Somalia","za":"South Africa","gs":"South Georgia and the South Sandwich Islands","ss":"South Sudan","es":"Spain","lk":"Sri Lanka","sd":"Sudan","sr":"Suriname","sj":"Svalbard and Jan Mayen","sz":"Swaziland","se":"Sweden","ch":"Switzerland","sy":"Syrian Arab Republic","tw":"Taiwan","tj":"Tajikistan","tz":"Tanzania, United Republic of","th":"Thailand","tl":"Timor-Leste","tg":"Togo","tk":"Tokelau","to":"Tonga","tt":"Trinidad and Tobago","tn":"Tunisia","tr":"Turkey","tm":"Turkmenistan","tc":"Turks and Caicos Islands","tv":"Tuvalu","ug":"Uganda","ua":"Ukraine","ae":"United Arab Emirates","gb":"United Kingdom","us":"United States","um":"United States Minor Outlying Islands","rd":"Unknown","uy":"Uruguay","uz":"Uzbekistan","vu":"Vanuatu","ve":"Venezuela","vn":"Vietnam","vg":"Virgin Islands, British","vi":"Virgin Islands, U.S.","wf":"Wallis and Futuna","eh":"Western Sahara","ye":"Yemen","zm":"Zambia","zw":"Zimbabwe"};

(function() {
  'use strict';
  'esversion: 6';

  var K = {
    gid: function (id) {
      return document.getElementById(id);
    },

    qS: function (sel) {
      return document.querySelector(sel);
    },

    qSa: function (sel) {
      return document.querySelectorAll(sel);
    },


    addCSSFile: function (path) {
      $("head").append('<link href="' + path + '" rel="stylesheet" type="text/css">');
    },


    reduceArray: function (arr) {
      var
        total = 0, prop;

      for (prop in arr) {
        if (arr.hasOwnProperty(prop)) {
          total += arr[prop];
        }
      }

      return total;
    },

    hex: function (x) {
      x = x.toString(16);
      return (x.length == 1) ? '0' + x : x;
    },

    date: {
      dayLengthInMs: 1000 * 60 * 60 * 24,
      // returns date in format of YYYY-MM-DD
      ISO8601DateStr: function (date) {
        return new Intl.DateTimeFormat('en-CA', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
          }).format(date);
      },

      // returns a string in format YYYY-MM-DD calculated basing on the user time
      calculateHqDate: function () {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
          }).format(Date.now());
      },

      getWeek: function (date) {
        let firstDayOfTheYear = K.date.firstDayOfAYear(date.getFullYear());
        let firstWednesday = 7 - firstDayOfTheYear - 3;
        if (firstWednesday <= 0) {
          firstWednesday += 7;
        }

        let startOfTheFirstWeek = firstWednesday - 3;
        let startOfTheFirstWeekDate = new Date(date.getFullYear(), 0, startOfTheFirstWeek);
        let currentWeek = Math.ceil(((date - startOfTheFirstWeekDate) / 86400000) / 7);

        return currentWeek;
      },

      // source: https://stackoverflow.com/a/16353241
      isLeapYear: function (year) {
        return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
      },

      firstDayOfAYear: function (year) {
        // 0 = Sunday, 1 = Monday, etc.
        return (new Date(year, 0, 1)).getDay();
      },

      numberOfWeeksInAYear: function (year) {
        // assuming, that week belongs to the year, which contains the middle day
        // of that week (which is Wednesday in case of Sun-Mon week)
        let firstDay = K.date.firstDayOfAYear(year);
        if (firstDay === 3 || K.date.isLeapYear(year) && (firstDay === 2 || firstDay === 4)) {
          return 53;
        }
        return 52;
      },

      getLast: {
        sevenDays: function (asDates = false) {
          let result = [];
          let currentHqDate = new Date(K.date.calculateHqDate());
          let weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          let currentDayOfWeek = currentHqDate.getDay();
          let weekLength = 7;
          let cursor;

          if (asDates) {
            cursor = new Date();
            cursor.setTime(currentHqDate.getTime() - weekLength * K.date.dayLengthInMs);

            while (weekLength--) {
              result.push(new Intl.DateTimeFormat('en-CA', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
              }).format(cursor));
              cursor.setDate(cursor.getDate() + 1);
            }
          }
          else {
            cursor = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
            while (weekLength--) {
              if (cursor >= 6) {
                cursor -= 6;
              }
              else {
                ++cursor;
              }

              result.push(weekdays[cursor]);
            }
          }

          return result;
        },

        tenWeeks: function (asDates = false) {
          let result = [];
          let currentHqDate = new Date(K.date.calculateHqDate());
          let year = currentHqDate.getFullYear();
          let currentWeek = K.date.getWeek(currentHqDate);
          let periodLength = 10;
          // -1 below, because we want the last day of the period to be the last completed week, not the current one,
          // but +1, because we want to start at the first day of the period not from
          // before the period started
          let starter = currentWeek - periodLength - 1 + 1;
          let cursor;
          let numberOfWeeksInTheCurrentYear = K.date.numberOfWeeksInAYear(year);
          let numberOfWeeksInThePreviousYear = K.date.numberOfWeeksInAYear(year - 1);

          if (asDates) {
            if (starter <= 0) {
              year--;
              starter += numberOfWeeksInThePreviousYear;
            }
            cursor = starter;
            while (periodLength--) {
              result.push(year + '-' + (cursor < 10 ? '0' : '') + cursor);
              ++cursor;
              if (cursor >= 53) {
                if (numberOfWeeksInTheCurrentYear === 52 || cursor === 54) {
                  cursor = 1;
                  year++;
                }
              }
            }
          }
          else {
            if (starter <= 0) {
              starter += numberOfWeeksInThePreviousYear;
            }
            cursor = starter;
            while (periodLength--) {
              result.push(cursor);
              ++cursor;
              if (cursor >= 53) {
                if (numberOfWeeksInTheCurrentYear === 52 || cursor === 54) {
                  cursor = 1;
                }
              }
            }
          }
          return result;
        },

        twelveMonths: function (asDates = false) {
          let result = [];
          let currentHqDate = new Date(K.date.calculateHqDate());
          let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          let currentMonth = currentHqDate.getMonth();
          let year = currentHqDate.getFullYear();
          let yearLength = 12;
          let cursor = currentMonth;

          // no matter what, if we substract 12 months from the current date, we'll be in the previous year
          --year;

          if (asDates) {
            result.push(year + '-' + (cursor < 9 ? '0' : '') + (cursor + 1));
            --yearLength;
            while (yearLength--) {
              if (cursor > 11) {
                cursor = 0;
                ++year;
              }
              else {
                ++cursor;
              }
              result.push(year + '-' + (cursor < 9 ? '0' : '') + (cursor + 1));
            }
          }
          else {
            result.push(months[cursor]);
            --yearLength;
            while (yearLength--) {
              if (cursor > 11) {
                cursor = 0;
              }
              else {
                ++cursor;
              }
              result.push(months[cursor]);
            }
          }

          return result;
        }
      },

      daysInMonth: function (month, year) {
        if (['April', 'June', 'September', 'November'].indexOf(month) !== -1) {
          return 30;
        }
        if (month === 'February') {
          return K.date.isLeapYear(year) ? 29 : 28;
        }
        return 31;
      },

      monthsFullNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    }
  };



function StatsPanel() {
  var
    _this = this,
    chart,
    dataCurrentlyInUse;


  this.map = null;
  this.dataType = 'points';
  this.timeRange = 'day';

  (function addMenuItem() {
    var
      li, a, list;

    li = document.createElement('li');
    li.id = 'ewsLinkWrapper';
    a = document.createElement('a');
    a.id = 'ewsLink';
    a.innerHTML = 'Stats';
    li.appendChild(a);
    list = K.gid('nav').getElementsByTagName('ul')[0];
    if (list) {
      list.insertBefore(li, list.lastChild.previousSibling); // for some reason the last child (the "Challenge" button) isn't the last child)
    }
    else {
      let ul = document.createElement('ul');
      ul.appendChild(li);
      K.gid('homelogo').after(ul);
    }

  })();

  // Stats dialog skeleton
  $('body').append(
   `<div id=ewsPanel>
      <div class="ewsNavButtonGroup" id=ewsTimeRangeSelection>
        <div class="ewsNavButton selected" data-time-range="day">today</div>
        <div class="ewsNavButton" data-time-range="week">week</div>
        <div class="ewsNavButton" data-time-range="month">month</div>
        <div class="ewsNavButton" id="ewsCustomPeriodSelection" data-time-range="custom">custom</div>
      </div>
      <table id=ewsChartWrapper>
        <tr>
          <td id=ewsLeftCell>
          </td>
          <td id=ewsAvg>
          </td>
          <td id=ewsRightCell>
            <div id=ewsChartFixedWrapper>
              <canvas id=ewsChart></canvas>
              <div id=ewsChartCenterLabel></div>
              <div id=ewsChartLegend></div>
            </div>
          </td>
        </tr>
      </table>
      <div class="ewsNavButtonGroup" id=ewsDataTypeSelection>
        <div class="ewsNavButton selected" data-data-type="points">points</div>
        <div class="ewsNavButton" data-data-type="cubes">cubes</div>
        <div class="ewsNavButton" data-data-type="people">people</div>
        <div class="ewsNavButton" data-data-type="trailblazes">trailblazes</div>
        <div class="ewsNavButton" data-data-type="scouts">scouts</div>
        <div class="ewsNavButton" data-data-type="scythes">scythes</div>
        <div class="ewsNavButton" data-data-type="completes">completes</div>
      </div>
    </div>
    <div id="ewsCustomTimeRangeSelectionDialog">
      <table>
        <tbody>
          <tr>
            <td><input type="radio" name="radioTimeRangeSelection" value="day" checked>day</td>
            <td>
              <select id="ewsTRSdayYear"></select>
              <select id="ewsTRSdayMonth"></select>
              <select id="ewsTRSdayDay"></select>
            </td>
          </tr>
          <tr>
            <td><input type="radio" name="radioTimeRangeSelection" value="week">week</td>
            <td>
              <select id="ewsTRSweekYear"></select>
              <select id="ewsTRSweekWeek"></select>
            </td>
          </tr>
          <tr>
            <td><input type="radio" name="radioTimeRangeSelection" value="month">month</td>
            <td>
              <select id="ewsTRSmonthYear"></select>
              <select id="ewsTRSmonthMonth"></select>
            </td>
          </tr>
          <tr>
            <td><input type="radio" name="radioTimeRangeSelection" value="custom">custom</td>
          </tr>
          <tr>
            <td>From</td>
            <td>
              <select id="ewsTRScustomFromYear"></select>
              <select id="ewsTRScustomFromMonth"></select>
              <select id="ewsTRScustomFromDay"></select>
            </td>
          </tr>
          <tr>
            <td>To</td>
            <td>
              <select id="ewsTRScustomToYear"></select>
              <select id="ewsTRScustomToMonth"></select>
              <select id="ewsTRScustomToDay"></select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div id=ewsWorldMap style="width: 873px;"></div>
    `
  );

  let s = {
    day: {
      year: K.gid('ewsTRSdayYear'),
      month: K.gid('ewsTRSdayMonth'),
      day: K.gid('ewsTRSdayDay')
    },
    week: {
      year: K.gid('ewsTRSweekYear'),
      week: K.gid('ewsTRSweekWeek')
    },
    month: {
      year: K.gid('ewsTRSmonthYear'),
      month: K.gid('ewsTRSmonthMonth')
    },
    customFrom: {
      year: K.gid('ewsTRScustomFromYear'),
      month: K.gid('ewsTRScustomFromMonth'),
      day: K.gid('ewsTRScustomFromDay')
    },
    customTo: {
      year: K.gid('ewsTRScustomToYear'),
      month: K.gid('ewsTRScustomToMonth'),
      day: K.gid('ewsTRScustomToDay')
    }
  };


  $('#ewsCustomTimeRangeSelectionDialog')
    .dialog({
      resizable: false,
      width: 400,
      height: 'auto',
      autoOpen: false,
      modal: true,
      title: 'Select time range',
      dialogClass: 'ews-custom-time-range-selection-dialog',
      open: function (evt) {
        $('.ui-widget-overlay:last').click(function () {
          $('.ews-custom-time-range-selection-dialog').find('.ui-dialog-content').dialog('close');
        });
      },
      buttons: {
        'Apply': function () {
          let selection = document.querySelector('input[name="radioTimeRangeSelection"]:checked').value;
          _this.customRangeType = selection;

          switch (selection) {
            case 'day':
              _this.customDate =
                s.day.year.value + '-' +
                s.day.month.value + '-' +
                s.day.day.value;
              break;

            case 'week':
              _this.customDate =
                s.week.year.value + '-' +
                s.week.week.value;
              break;

            case 'month':
              _this.customDate =
                s.month.year.value + '-' +
                s.month.month.value;
              break;
            case 'custom':
              _this.customDate =
                s.customFrom.year.value + '-' +
                s.customFrom.month.value + '-' +
                s.customFrom.day.value + '|' +
                s.customTo.year.value + '-' +
                s.customTo.month.value + '-' +
                s.customTo.day.value;
              break;
          }

          _this.getData();
          $(this).dialog('close');
        },
        'Cancel': function () {
          $(this).dialog('close');
        }
      }
    })
    .css('display', 'block');


  function optionsYears(select) {
    let str = '';
    for (let i = 2012; i < 2100; i++) {
      str += '<option value="' + i + '"' + (i === select ? ' selected' : '') + '>' + i;
    }

    return str;
  }

  function optionsMonths(select) {
    let str = '';
    if (select === 0) {
      select = 12;
    }
    for (let i = 1, len = K.date.monthsFullNames.length + 1; i < len; i++) {
      str += '<option value="' + (i < 10 ? '0' : '') + i + '"' + (i === select ? ' selected' : '') + '>' + K.date.monthsFullNames[i - 1];
    }

    return str;
  }

  function optionsWeeks(year, month, day) {
    let str = '';
    let val, txt, dt;
    let firstDayOfTheYear = K.date.firstDayOfAYear(year);
    let numberOfWeeks = K.date.numberOfWeeksInAYear(year);
    let dayLengthInMs = 24 * 60 * 60 * 1000;
    let dateDiff = 0;
    let selected = false;
    // the week containing the first Wednesday if the first week (Sun-Mon) of the year
    let firstWednesday = 7 - firstDayOfTheYear - 3;
    if (firstWednesday <= 0) {
      firstWednesday += 7;
    }
    let date = new Date(year, 0, firstWednesday - 4); // -4 because -3 gives Sunday, but the loop below adds +1 to the first date, so we have to start a day earlier
    for (let i = 1; i < numberOfWeeks + 1; i++) {
      date.setDate(date.getDate() + 1);
      if (month && day) {
        dateDiff = (new Date(year, month - 1, day) - date) / dayLengthInMs;
        if (dateDiff >= 0 && dateDiff <= 7) {
          selected = true;
        }
        else {
          selected = false;
        }
      }
      dt = K.date.ISO8601DateStr(date);
      val = (i < 10 ? '0' : '') + i + '|' + dt;
      txt = i + ' (' + dt + ' - ';
      date.setDate(date.getDate() + 6);
      dt = K.date.ISO8601DateStr(date);
      val += '|' + dt;
      txt += dt + ')';
      str += '<option value="' + val + '"' + (selected ? ' selected' : '') + '>' + txt;
    }

    return str;
  }

  function optionsDays(year, month, select) {
    let str = '';
    for (let i = 1, len = K.date.daysInMonth(month, year) + 1; i < len; i++) {
      str += '<option value="' + (i < 10 ? '0' : '') + i + '"' + (i === select ? ' selected' : '') + '>' + i;
    }

    return str;
  }


  let date = new Date(K.date.calculateHqDate());
  let currentMonth = date.getMonth() + 1;
  date.setDate(date.getDate() - 1); // data for today is not available today
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  date.setDate(date.getDate() - 6); // to get a date from the previous week

  s.day.year.innerHTML = optionsYears(year);
  s.day.month.innerHTML = optionsMonths(month);
  s.day.day.innerHTML = optionsDays(year, month, day);

  s.week.year.innerHTML = optionsYears(date.getFullYear());
  s.week.week.innerHTML = optionsWeeks(date.getFullYear(), date.getMonth() + 1, date.getDate());

  s.month.year.innerHTML = optionsYears(currentMonth === 1 ? year - 1 : year);
  s.month.month.innerHTML = optionsMonths(currentMonth - 1);

  s.customFrom.year.innerHTML = optionsYears(year);
  s.customFrom.month.innerHTML = optionsMonths(month);
  s.customFrom.day.innerHTML = optionsDays(year, month, day);

  s.customTo.year.innerHTML = optionsYears(year);
  s.customTo.month.innerHTML = optionsMonths(month);
  s.customTo.day.innerHTML = optionsDays(year, month, day);

  s.customFrom.year.dataset.previousValue = s.customFrom.year.value;
  s.customFrom.month.dataset.previousValue = s.customFrom.month.value;
  s.customFrom.day.dataset.previousValue = s.customFrom.day.value;

  s.customTo.year.dataset.previousValue = s.customTo.year.value;
  s.customTo.month.dataset.previousValue = s.customTo.month.value;
  s.customTo.day.dataset.previousValue = s.customTo.day.value;

  $('#ewsTRSdayYear, #ewsTRScustomFromYear, #ewsTRScustomToYear').change(function () {
    // if the selected month is February, we have to be update the number of days
    // according to the year (if is leap or not)
    let idPart = this.id.replace('ewsTRS', '').replace('Year', '');
    if (K.gid('ewsTRS' + idPart + 'Month').value === '2') {
      K.gid('ewsTRS' + idPart + 'Day').innerHTML = optionsDays(this.value, K.date.monthsFullNames[1], 1);
    }
  });

  $('#ewsTRSdayMonth, #ewsTRScustomFromMonth, #ewsTRScustomToMonth').change(function () {
    let idPart = this.id.replace('ewsTRS', '').replace('Month', '');
    let year = K.gid('ewsTRS' + idPart + 'Year').value;
    let month =  this.options[this.selectedIndex].text;
    K.gid('ewsTRS' + idPart + 'Day').innerHTML = optionsDays(year, month, 1);
  });


  $('#ewsTRSweekYear').change(function () {
    s.week.week.innerHTML = optionsWeeks(this.value);
  });

  $('#ewsTRScustomFromYear, #ewsTRScustomFromMonth, #ewsTRScustomFromDay, #ewsTRScustomToYear, #ewsTRScustomToMonth, #ewsTRScustomToDay').change(function () {

    let fromYear = s.customFrom.year.value;
    let fromMonth = s.customFrom.month.value;
    let fromDay = s.customFrom.day.value;

    let toYear = s.customTo.year.value;
    let toMonth = s.customTo.month.value;
    let toDay = s.customTo.day.value;

    let previousFromYear = s.customFrom.year.dataset.previousValue;
    let previousFromMonth = s.customFrom.month.dataset.previousValue;
    let previousFromDay = s.customFrom.day.dataset.previousValue;

    let previousToYear = s.customTo.year.dataset.previousValue;
    let previousToMonth = s.customTo.month.dataset.previousValue;
    let previousToDay = s.customTo.day.dataset.previousValue;

    // all the values above are string so we'll get a date not a sume of the numbers
    if (fromYear + fromMonth + fromDay > toYear + toMonth + toDay) {
      s.customFrom.year.value = previousFromYear;
      s.customFrom.month.value = previousFromMonth;
      s.customFrom.day.value = previousFromDay;

      s.customTo.year.value = previousToYear;
      s.customTo.month.value = previousToMonth;
      s.customTo.day.value = previousToDay;
      alert('The "To: " date cannot be earlier then the "From: " date.');
    }
    else {
      this.dataset.previousValue = this.value;
    }
  });


  this.generateTableRow = function (position, flag, name, value, highlight) {
    return '<tr class="ewsRankingRow' + (highlight ? 'Highlight' : 'Normal') + '">' + // highlighting currently not used
        '<td>' + position + '</td>' +
        '<td>' + (flag === 'rd' || flag === ' ' ? '&nbsp;' : '<img src="https://eyewire.org/static/images/flags/' + flag + '.png">') + '</td>' +
        '<td><div class="ewsCountryNameWrapper">' + name + '</div></td>' +
        '<td>' + value + '</td>' +
      '</tr>';
  };


  this.generateTableHTML = function (data) {
    var
      position = 0,
      html = '';

    if (data === 'no-data') {
      html = '<tr><td>NO DATA</td></tr>';
    }
    else {
      for (let el of data) {
        html += this.generateTableRow(++position, el.flag, el.name, el.value, el.highlight);
      }
    }

    return '<table>' + html + '</table>';
  };


  this.createTable = function (data, limit) {
    let tableData = [];

    if (data === 'no-data') {
      tableData = data;
    }
    else {
      let amountPerCountrySortedKeys = this.getSortedKeys(data);

      if (typeof limit === 'undefined') {
        limit = 10;
      }

       for (let index of amountPerCountrySortedKeys) {
         if (index !== 'RD' && index !== 'EU') {
           tableData.push({
             flag: index.toLowerCase(),
             name: countries[index.toLowerCase()],
             value: data[index],
             highlight: false
           });

           limit--;
         }

        if (!limit) break;
      }
    }

    return this.generateTableHTML(tableData);
  };


  this.updateTable = function (data) {
    K.gid('ewsLeftCell').innerHTML = this.createTable(data);
  };


  this.groupByCountry = function (data) {
    var
      country, grouped = [];

    if (this.dataType !== 'people') {
      for (let row of data) {
        country = row.country.toUpperCase();
        if (!grouped[country]) {
          grouped[country] = row.points;
        }
        else {
          grouped[country] += row.points;
        }
      }
    }
    else {
      for (let row of data) {
        country = row.country.toUpperCase();
        if (!grouped[country]) {
          grouped[country] = 1;
        }
        else {
          grouped[country]++;
        }
      }
    }

    return grouped;
  };

  this.createMap = function () {
    $('#ewsWorldMap').vectorMap({
      map: 'world_mill',
      series: {
        regions: [{
          scale: ['#C8EEFF', '#0071A4'],
          normalizeFunction: 'polynomial'
        }]
      },
      onRegionTipShow: function (e, el, code) {
        var
          lbl,
          htmlRows = '',
          rowCounter = 0,
          lCode = code.toLowerCase(),
          val = _this.map.series.regions[0].values[code];


        switch (_this.dataType) {
          case 'cubes': lbl = 'cube'; break;
          case 'points': lbl = 'point'; break;
          case 'people': lbl = 'person'; break;
          case 'trailblazes': lbl = 'trailblaze'; break;
          case 'scouts': lbl = 'flag'; break;
          case 'scythes': lbl = 'scythe'; break;
          case 'completes': lbl = 'completion'; break;
        }

        if (val != 1) {
          if (_this.dataType === 'people') {
            lbl = 'people';
          }
          else {
            lbl += 's';
          }
        }

        dataCurrentlyInUse.sort(function (a, b) {
          if (a.points > b.points) return -1;
          if (a.points === b.points) return 0;
          if (a.points < b.points) return 1;
        });

        for (let row of dataCurrentlyInUse) {
          if (row.country === lCode) {
            htmlRows += '<tr><td>' + row.username + '</td><td>' + (_this.dataType !== 'people' ? row.points : '&nbsp;') + '</td></tr>';
            if (++rowCounter % 30 === 0) {
              htmlRows += '</table><table>';
            }
          }
        }

        if (htmlRows === '') {
          htmlRows = '<tr><td class="ews-world-map-tooltip-empty-row">';
          switch (_this.dataType) {
            case 'points': htmlRows += 'No points earned by players from '; break;
            case 'cubes':  htmlRows += 'No cubes traced by players from '; break;
            case 'people': htmlRows += 'No players from '; break;
            case 'trailblazes': htmlRows += 'No trailblazes made by players from '; break;
            case 'scouts': htmlRows += 'No flags made by players from '; break;
            case 'scythes': htmlRows += 'No cubes scythed by players from '; break;
            case 'completes': htmlRows += 'No completes made by players from '; break;
          }
          htmlRows += _this.map.regions[code].config.name + '</td></tr>';
        }

        el.html('<div>' +
          (code == 'rd' ? '' : '<img src="https://eyewire.org/static/images/flags/' + lCode + '.png">') +
          el.html() + ' - ' + (val === undefined ? 0 : val) + ' ' + lbl +'<hr>' +
            '<table>' + htmlRows + '</table>' +
          '</div>'
        );
      }
    });

    this.map = $('#ewsWorldMap').vectorMap('get', 'mapObject');
  };


  this.getMap = function () {
    return this.map;
  };

  this.updateMap = function (values) {
    var
      el, key,
      min = 1000, max = 0;

    if (values !== 'no-data') {
      for (key in values) {
        if (values.hasOwnProperty(key)) {
          el = values[key];
          if (el < min) {
            min = el;
          }
          if (el > max) {
            max = el;
          }
        }
      }
    }

    // source: https://github.com/bjornd/jvectormap/issues/221#issuecomment-63071490
    this.map.params.series.regions[0].min = min;
    this.map.params.series.regions[0].max = max;
    this.map.series.regions[0].clear(); // if not cleared, the values, which aren't in the current set, remain from the previous set

    if (values !== 'no-data') {
      this.map.series.regions[0].setValues(values);
    }
  };

  this.createChart = function (label) {
      var
        ctx = K.gid("ewsChart").getContext('2d');

      chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          datasets: [{
            backgroundColor: [
              'rgba(87,  0, 218, 1)',
              'rgba(139, 1, 220, 1)',
              'rgba(192, 2, 223, 1)',
              'rgba(226, 2, 205, 1)',
              'rgba(228, 3, 155, 1)',
              'rgba(231, 4, 105, 1)',
              'rgba(233, 4,  54, 1)',
              'rgba(236, 9,   5, 1)',
              'rgba(239, 63,  6, 1)',
              'rgba(241, 118, 7, 1)'
            ],
            borderColor: [
              'rgba(87,  0, 218, 1)',
              'rgba(139, 1, 220, 1)',
              'rgba(192, 2, 223, 1)',
              'rgba(226, 2, 205, 1)',
              'rgba(228, 3, 155, 1)',
              'rgba(231, 4, 105, 1)',
              'rgba(233, 4,  54, 1)',
              'rgba(236, 9,   5, 1)',
              'rgba(239, 63,  6, 1)',
              'rgba(241, 118, 7, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          maintainAspectRatio: false,
          cutoutPercentage: 70,
          layout: {
            padding: {
              left: 150
            }
          },
          tooltips: {
            position: 'nearest'
          },
          legend: {
            position: 'left',
            display: false,
            onClick: null
          },
          legendCallback: function (ch) {
            var
              i, len,
              text = [];

            text.push('<ul>');
            for (i = 0, len = ch.config.data.datasets[0].data.length; i < len; i++) {
              text.push('<li>');
              text.push('<div style="background-color:' + ch.config.data.datasets[0].borderColor[i] + '">&nbsp;</div>' + ch.config.data.labels[i]);
              text.push('</li>');
            }
            text.push('</ul>');
            return text.join("");
          }
        }
      });
  };


  this.getDataForChart = function (data, limit) {
    var
      labels = [],
      values = [],
      amountPerCountrySortedKeys,
      sumOfOthers = 0;

    if (typeof limit === 'undefined') {
      limit = 10;
    }

    amountPerCountrySortedKeys = this.getSortedKeys(data);
    for (let index of amountPerCountrySortedKeys) {
      if (limit > 1 && index !== 'RD' && index !== 'EU') { // > 1 because of "Others"
        limit--;
        labels.push(countries[index.toLowerCase()]);
        values.push(data[index]);
      }
      else {
        sumOfOthers += data[index];
      }
    }

    labels.push('Others');
    values.push(sumOfOthers);

    return {
      labels: labels,
      values: values
    };
  };


  this.updateChart = function (data) {
    let
      html1, html2, html3,
      chartData = this.getDataForChart(data),
      date;

    if (data === 'no-data') {
      K.gid('ewsChartCenterLabel').innerHTML = 'NO DATA';
      K.gid('ewsChartLegend').innerHTML = '';
      chart.config.data.labels = [];
      chart.config.data.datasets[0].data = [];
      chart.update();
      return;
    }

    chart.config.data.labels = chartData.labels.slice(0);
    chart.config.data.datasets[0].data = chartData.values.slice(0);

    chart.update();

    switch (this.dataType) {
      case 'cubes':
        html1 = 'We have traced';
        html2 = 'cubes ';
      break;
      case 'points':
        html1 = 'We have earned';
        html2 = 'points ';
        break;
      case 'people':
        html1 = 'There were';
        html2 = 'players ';
        break;
      case 'trailblazes':
        html1 = 'There were';
        html2 = 'trailblazes ';
        break;
      case 'scouts':
        html1 = 'There were';
        html2 = 'flags ';
        break;
      case 'scythes':
        html1 = 'There were';
        html2 = 'cubes scythed ';
        break;
      case 'completes':
        html1 = 'There were';
        html2 = 'completes ';
        break;
    }

    switch (this.timeRange) {
      case 'day': html3 = ' today'; break;
      case 'week': html3 = ' this week'; break;
      case 'month': html3 = ' this month'; break;
      case 'custom':
        switch (this.customRangeType) {
          case 'day': html3 = ' on ' + this.customDate; break;
          case 'week':
            date = this.customDate.split('-');
            date[1] = date[1].split('|');
            date[1] = date[1][0];
            let remainder = date[1] % 10;
            let ordinal;
            switch (remainder) {
              case 1:  ordinal = 'st'; break;
              case 2:  ordinal = 'nd'; break;
              case 3:  ordinal = 'rd'; break;
              default: ordinal = 'th';
            }
            html3 = ' at ' + parseInt(date[1]) + ordinal + ' week of ' + date[0];
            break;
          case 'month':
            date = this.customDate.split('-');
            html3 = ' in ' + K.date.monthsFullNames[date[1] - 1];
            break;
          case 'custom':
            date = this.customDate.split('|').join(' and ');
            html3 = ' between ' + date;
            break;
        }
      break;
    }


    K.gid('ewsChartCenterLabel').innerHTML = html1 + '<br><span>' + K.reduceArray(data) + '</span><br>' + html2 + html3;
    K.gid('ewsChartLegend').innerHTML = chart.generateLegend(); // custom legend
  };


  // source: https://stackoverflow.com/a/11811767
  this.getSortedKeys = function (obj) {
    var
      key, keys = [];

    for(key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key);
      }
    }

    return keys.sort(function(a, b) {
      return obj[b] - obj[a];
    });
  };


  this.countAveragePerUser = function () {
    var
      counter = 0,
      sum = 0;

    for (let row of dataCurrentlyInUse) {
      counter++;
      sum += row.points;
    }

    return counter ? Math.round(sum / counter * 100) / 100 : 0;
  };


  this.countAveragePerCountry = function () {
    var
      data,
      index,
      counter = 0,
      sum = 0;

    data = this.groupByCountry(dataCurrentlyInUse);
    for (index in data) {
      if (data.hasOwnProperty(index)) {
        counter++;
      }
    }

    for (let row of dataCurrentlyInUse) {
      sum += row.points;
    }

    return counter ? Math.round(sum / counter * 100) / 100 : 0;
  };


  this.countAverageOfPlayersPerCountry = function () {
    var
      data,
      index,
      counter = 0,
      sum = 0;

    data = this.groupByCountry(dataCurrentlyInUse);
    for (index in data) {
      if (data.hasOwnProperty(index)) {
        sum += data[index];
        counter++;
      }
    }

    return counter ? Math.round(sum / counter * 100) / 100 : 0;
  };


  this.updateAverages = function () {
    var
      html,
      html1, html2;

    if (arguments[0] && arguments[0] === 'no-data') {
      K.gid('ewsAvg').innerHTML = 'NO DATA';
      return;
    }

    switch (this.dataType) {
      case 'points':
        html1 = 'points per user';
        html2 = 'points per country';
        break;
      case 'cubes':
        html1 = 'cubes per user';
        html2 = 'cubes per country';
        break;
      case 'people':
        html1 = 'players per country';
        html2 = '';
        break;
      case 'trailblazes':
        html1 = 'trailblazes per user';
        html2 = 'trailblazes per country';
        break;
      case 'scouts':
        html1 = 'flags per user';
        html2 = 'flags per country';
        break;
      case 'scythes':
        html1 = 'scythes per user';
        html2 = 'scythes per country';
        break;
      case 'completes':
        html1 = 'completes per user';
        html2 = 'completes per country';
        break;
    }

    html = 'Average of ' + html1 + ':<br><span>' + (this.dataType === 'people' ? this.countAverageOfPlayersPerCountry() : this.countAveragePerUser()) + '</span>';

    if (this.dataType !== 'people') {
      html += '<br><br><br>Average of ' + html2 + ':<br><span>' + this.countAveragePerCountry() + '</span>';
    }

    K.gid('ewsAvg').innerHTML = html;
  };


  this.getData = function () {
    let url;

    // we are checking for the class to take into account both clicking Apply
    // from the Custom dialog and changing the tabs at the bottom of the main dialog
    if (K.gid('ewsCustomPeriodSelection').classList.contains('selected')) {
        let date = this.customDate;
        let dateFrom, dateTo, splittedDate;
        switch (this.customRangeType) {
          case 'day':
            dateFrom = this.customDate;
            dateTo = this.customDate;
            break;
          case 'week':
            date = this.customDate.split('|');
            dateFrom = date[1];
            dateTo = date[2];
            break;
          case 'month':
            splittedDate = date.split('-');
            dateFrom = date + '-01';
            dateTo = date + '-' + K.date.daysInMonth(splittedDate[0], splittedDate[1]);
            break;
          case 'custom':
            splittedDate = date.split('|');
            dateFrom = splittedDate[0];
            dateTo = splittedDate[1];
            break;
        }
        url = 'http://ewstats.feedia.co/custom_stats.php' +
          '?type=' + this.dataType +
          '&custom_range_type=' + this.customRangeType +
          '&date=' + this.customDate;

      GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        onload: function (response) {
          if (response && response.responseText) {
            if (response.responseText !== '[]') {
              let data = JSON.parse(response.responseText);
              dataCurrentlyInUse = data;
              data = _this.groupByCountry(data);
              _this.updateMap(data);
              _this.updateChart(data);
              _this.updateTable(data);
              _this.updateAverages();
            }
            else {
              _this.updateMap('no-data');
              _this.updateChart('no-data');
              _this.updateTable('no-data', 0);
              _this.updateAverages('no-data');
            }
          }
        },
        onerror: function (response) {
          console.error('error: ', response);
        }
      });
    }
    else {
        url = 'https://eyewire.org/1.0/stats/top/players/by/';

      switch (this.dataType) {
        case 'people':
          url += 'points';
          break;
        case 'completes':
          url += 'complete';
          break;
        default:
          url += this.dataType;
      }

      url += '/per/';

      if (this.timeRange === 'today') {
        url += 'day';
      }
      else {
        url += this.timeRange;
      }
      $.getJSON(url, function (data) {
        dataCurrentlyInUse = data;
        data = _this.groupByCountry(data);
        _this.updateMap(data);
        _this.updateChart(data);
        _this.updateTable(data);
        _this.updateAverages();
      });
    }
  };

  // source: https://stackoverflow.com/a/68503
  $(document)
    .ajaxStart(function () {
      $('#ewsLoader').addClass('onscreen');
      setTimeout(function () {
        $('#ewsLoader').removeClass('onscreen'); // to remove animation, if it didn't stop automatically
      }, 10000);
    })
    .ajaxStop(function () {
      setTimeout(function () {
        $('#ewsLoader').removeClass('onscreen');
      }, 500); // to make animation more visible
    });

  $('#ewsPanel').dialog({
    autoOpen: false,
    hide: true,
    modal: true,
    show: true,
    dialogClass: 'ews-dialog',
    title: 'EyeWire Statistics <div class="blinky" id=ewsLoader>',
    width: 900,
    open: function (event, ui) {
      let el = K.gid('ewsWorldMap');
      if (el.parentNode.tagName === 'BODY') {
        let sibling = K.gid('ewsTimeRangeSelection');
        sibling.parentNode.insertBefore(el, sibling.nextSibling);
        el.style.visibility = 'visible';
        el.style.top = 'inherit';
        el.style.left = '50%';
        $('#ewsPanel').dialog('option', 'position', {my: "center", at: "center", of: window});
      }
      $('.ui-widget-overlay').click(function() { // close by clicking outside the window
        $('#ewsPanel').dialog('close');
      });
      _this.map.updateSize();
      _this.getData();
    }
  });

  $('#ewsLink').click(function () {
    if (!_this.map) {
      _this.createMap();
    }
    $('#ewsPanel').dialog('open');
  });

  $('#ewsChart').hover(
    function () {
      $('#ewsChartCenterLabel').animate({'opacity' : 0.2});
    },
    function () {
      $('#ewsChartCenterLabel').animate({'opacity' : 1});
    }
  );

  $('.ewsNavButtonGroup').on('click', '.ewsNavButton', function (event) {
    var
      $this = $(this),
      data = $this.data();

    $this
      .parent()
        .find('.ewsNavButton')
          .removeClass('selected')
        .end()
      .end()
      .addClass('selected');

    if (data.dataType) {
      _this.dataType = data.dataType;
    }
    else if (data.timeRange) {
      _this.timeRange = data.timeRange;
    }

    if (this.id === 'ewsCustomPeriodSelection') {
      $('#ewsCustomTimeRangeSelectionDialog').dialog('open');
    }
    else {
      _this.getData();
    }
  });

  this.createChart('points');
}



K.addCSSFile('https://chrisraven.github.io/EyeWire-Statistics/jquery-jvectormap-2.0.3.css');

if (LOCAL) {
  K.addCSSFile('http://127.0.0.1:8887/statistics.css');
}
else {
  K.addCSSFile('https://chrisraven.github.io/EyeWire-Statistics/styles.css');
}


// source: https://stackoverflow.com/a/14488776
// to allow html code in the title option of a dialog window
$.widget('ui.dialog', $.extend({}, $.ui.dialog.prototype, {
  _title: function(title) {
    if (!this.options.title) {
      title.html('&#160;');
    }
    else {
      title.html(this.options.title);
    }
  }
}));


let intv = setInterval(function () {
    if (typeof Chart !== 'undefined' && K.gid('nav')) {
    clearInterval(intv);
    new StatsPanel(); // jshint ignore:line
  }
}, 50);

})(); // end: wrapper
