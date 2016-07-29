/**
 * Schedule view. Displays periods of selected courses in a week grid.
 * @param {Object} data - Object containing schedule data as returned from the API
 * @return {undefined}
 * @memberOf Yacs.views
 */
Yacs.views.schedule = function (data) {
  Yacs.setContents(HandlebarsTemplates.schedule(data));
  var scheduleElement = document.querySelector('#schedule-container');
  var leftSwitchElement = document.querySelector('#left-switch');
  var rightSwitchElement = document.querySelector('#right-switch');
  var clearButtonElement = document.querySelector('#clear-btn');
  var scheduleNumElement = document.querySelector('#schedule-num');
  var crnListElement = document.querySelector('#crn-list');
  var schedule = new Schedule(scheduleElement);
  var scheduleIndex = 0;


  // this function will be deprecated when backend is updated to use minutes-since-midnight format
  // see issue #102
  var toMinutes = function (timeString) {
    var int = parseInt(timeString);
    return Math.floor(int / 100) * 60 + int % 100;
  }

  var transformSchedule = function (schedule) {
    var events = [];
    var crns = [];

    schedule.sections.forEach(function (section) {
      var color = crns.indexOf(section.crn);
      if (color === -1) {
        crns.push(section.crn);
        color = crns.length - 1;
      }

      section.periods.forEach(function (period) {
        events.push({
          start: toMinutes(period.start),
          end: toMinutes(period.end),
          day: period.day,
          colorNum: color,
          title: section.department_code + ' ' + section.course_number + ' - ' + section.name
        });
      });
    });
    return { events: events, crns: crns };
  };

  var showSchedule = function (index) {
    var scheduleData = transformSchedule(data.schedules[index]);
    schedule.setEvents(scheduleData.events)
    scheduleNumElement.textContent = index + 1;
    crnListElement.textContent = 'CRNs: ' + scheduleData.crns.join(', ');
  }

  /* this is before `if(data.schedules.length==0)` because clear selection should */
  /* still work even if courses conflict and there are zero possible schedules    */
  Yacs.on('click', clearButtonElement, function () {
    /* clear if the user has any selections */  
    if (Yacs.user.getSelections().length != 0) {
      Yacs.user.clearSelections();
      Yacs.views.schedule({schedules:[]});
    }
    clearButtonElement.blur();
  });

  if(data.schedules.length == 0) {
    // TODO: this will happen if there are no available schedules
    crnListElement.textContent = 'No courses selected';
    return;
  }

  Yacs.on('click', leftSwitchElement, function () {
    scheduleIndex = (--scheduleIndex < 0 ? data.schedules.length - 1 : scheduleIndex);
    showSchedule(scheduleIndex%data.schedules.length);
  });
  Yacs.on('click', rightSwitchElement, function () {
    scheduleIndex = (++scheduleIndex < data.schedules.length ? scheduleIndex : 0);
    showSchedule(scheduleIndex%data.schedules.length);
  });

  showSchedule(scheduleIndex);
};
