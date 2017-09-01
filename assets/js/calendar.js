Vue.component('weekday', {
  template: document.getElementById("weekday-template").innerText,
  props: ['date', 'events'],
  methods: {
    starting: function(event) {
      return this.formatDate(event.starts_at, "h:mm a");
    },
    formatDate: function(date, format) {
      var rawDate = new Date(date);
      if(format === "short") {
        return rawDate.getMonth() + 1 + "/" +rawDate.getDate();
      } else if (format === "long") {
        return this.weekdayName(rawDate.getDay()) + " " + (rawDate.getMonth() + 1) + "/" + rawDate.getDate();
      } else if (format === "longtime") {
        return this.weekdayName(rawDate.getDay()) + " " + (rawDate.getMonth() + 1) + "/" + rawDate.getDate() + " at " + (rawDate.getHours() + 1);
      } else {
        return moment(date).format(format)
      }
    },
    weekdayName: function(weekday) {
      if(weekday === 0) return "Sunday";
      if(weekday === 1) return "Monday";
      if(weekday === 2) return "Tuesday";
      if(weekday === 3) return "Wednesday";
      if(weekday === 4) return "Thursday";
      if(weekday === 5) return "Friday";
      if(weekday === 6) return "Saturday";
    }
  }
})

new Vue({
  el: "#calendar",
  data: {
    events: window.events,
    today: new Date(),
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    display: "week",
    currentWeek: Math.ceil(new Date().getDate() / 7)
  },
  created: function() {
    document.addEventListener("keydown", function(e) {
      if(e.key == "ArrowRight" || e.code == "ArrowRight") {
        this.next();
      } else if (e.key == "ArrowLeft" || e.code == "ArrowLeft") {
        this.previous();
      }
    }.bind(this));

    // If the window gets to small, automatically
    // kick the user to weekly view
    window.addEventListener("resize", function(event) {
      if(jQuery(window).width() < 768) {
        this.display = "week";
      }
    }.bind(this))
  },
  computed: {
    currentMonthName: function() {
      return ["January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"][this.currentMonth];
    },
    weeks: function() {
      var beginningOfMonth = new Date(this.currentYear, this.currentMonth, 1);
      var endOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
      var daysInMonth = endOfMonth.getDate();
      var offset = beginningOfMonth.getDay();
      var totalWeeks = Math.ceil((daysInMonth + offset) / 7);
      return totalWeeks;
    },
  },
  methods: {
    date: function(currentMonth, week, day) {
      week = week - 1;
      var beginningOfMonth = new Date(this.currentYear, this.currentMonth, 1);
      var endOfMonth = new Date(this.currentYear, this.currentMonth + 1, 1);
      endOfMonth.setDate(-1)
      var daysInMonth = endOfMonth.getDate();
      var offset = beginningOfMonth.getDay();
      var date = ((week * 7) + day - offset + 1);
      if((week === 0 && day < offset) || (day + (week * 7) > (daysInMonth + offset - 1))) {
        if(this.display == "month") {
          return "";
        } else {
          if(date - daysInMonth < 0) {
            beginningOfMonth.setDate(0);
            return beginningOfMonth.getDate();
          } else {
            return date - daysInMonth;
          }
        }
      } else {
        return date;
      }
    },
    dateO: function(currentMonth, week, day) {
      week = week - 1;
      var beginningOfMonth = new Date(this.currentYear, this.currentMonth, 1);
      var endOfMonth = new Date(this.currentYear, this.currentMonth + 1, 1);
      endOfMonth.setDate(-1)
      var daysInMonth = endOfMonth.getDate();
      var offset = beginningOfMonth.getDay();
      var date = ((week * 7) + day - offset + 1);

      var target = new Date(this.currentYear, this.currentMonth, 1)
      target.setDate(date);
      return target;
    },
    isToday: function(date) {
      date = new Date(this.currentYear, this.currentMonth, date)
      return this.formatDate(this.today, 'short')== this.formatDate(date, 'short');
    },
    month: function(currentMonth, week, day) {
      week = week - 1;
      var beginningOfMonth = new Date(this.currentYear, this.currentMonth, 1);
      var endOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
      var daysInMonth = endOfMonth.getDate();
      var offset = beginningOfMonth.getDay();

      if((week * 7 + day - offset + 1) > daysInMonth) {
        return currentMonth + 2;
      } else if ((week * 7 + day - offset + 1) <= 0) {
        return currentMonth;
      } else {
        return currentMonth + 1;
      }
    },
    nextMonth: function() {
      this.currentMonth++;
      if(this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
    },
    previousMonth: function() {
      this.currentMonth--;
      if(this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
    },
    goToMonth: function(month, year) {
      this.currentMonth = month;
      this.currentYear = year;
    },
    goToToday: function() {
      this.goToMonth(this.today.getMonth(), this.today.getFullYear())
      this.currentWeek = Math.ceil(this.today.getDate() / 7);
    },
    eventsOnDay: function(date) {
      var today = new Date(this.currentYear, this.currentMonth, date);
      return this.eventsOnDate(today);
    },
    eventsOnDate: function(date) {
      var events = [];
      for(var i = 0; i < window.events.length; i++) {
        var event = window.events[i];
        if(this.eventHappensOn(event, date)) {
          events.push(event)
        }
      }
      events.sort(function(a,b) { return a.starts_at >= b.starts_at })

      return events;
    },

    eventsOnWeek: function(date) {
      // Get a list of all of the events that happen
      // in the week starting at <date>

      var weekEvents = [];
      // var sunday = new Date(this.currentYear, this.currentMonth, date);
      //   sunday.setDate(sunday.getDate() - sunday.getDay());

      var clone = function(d) {
        return new Date(
          JSON.parse(
            JSON.stringify(d)
          )
        )
      }

      for(var i=0; i<7; ++i) {
        var today = clone(date);
        today.setDate(clone(date).getDate() + i);
        weekEvents = weekEvents.concat(this.eventsOnDate(today));
      }

      // Filter out duplicates
      weekEvents = weekEvents.filter(function(value, index, self) {
        return self.indexOf(value) === index;
      })

      return weekEvents;
    },
    eventHappensOn: function(event, day) {
      return event.starts_at.isSame(moment(day), 'day') || event.ends_at.isSame(moment(day), 'day');
    },
    displayMonth: function() {
      this.display = "month";
    },
    displayWeek: function() {
      this.display = "week";
      if(this.today.getMonth() == this.currentMonth) {
        this.currentWeek = Math.ceil(this.today.getDate() / 7);
      } else {
        this.currentWeek = 1;
      }
    },
    previous: function() {
      if(this.display == "month") {
        this.previousMonth()
      } else {
        this.previousWeek();
      }
    },
    next: function() {
      if(this.display == "month") {
        this.nextMonth();
      } else {
        this.nextWeek();
      }
    },
    nextWeek: function() {
      this.currentWeek++;
      if(this.currentWeek > this.weeks) {
        if(this.dateO(this.currentMonth, this.currentWeek - 1, 6).getMonth() > this.currentMonth ) {
          this.currentWeek = 2;
        } else {
          this.currentWeek = 1;
        }
        this.nextMonth();
      }
    },
    previousWeek: function() {
      this.currentWeek--;
      if(this.currentWeek < 0) {
        this.previousMonth();
        this.currentWeek = this.weeks - 1;
      }
    },
    starting: function(event) {
      return this.formatDate(event.starts_at, "h:mm a");
    },
    ending: function(event) {
      var start = new moment(event.starts_at);
      var end = new moment(event.ends_at);
      if(start.isSame(end, 'day')) {
        return this.formatDate(new Date(event.ends_at), "h:mm a")
      } else {
        return "";
      }
    },
    formatDate: function(date, format) {
      var rawDate = new Date(date);
      if(format === "short") {
        return rawDate.getMonth() + 1 + "/" +rawDate.getDate();
      } else if (format === "long") {
        return this.weekdayName(rawDate.getDay()) + " " + (rawDate.getMonth() + 1) + "/" + rawDate.getDate();
      } else if (format === "longtime") {
        return this.weekdayName(rawDate.getDay()) + " " + (rawDate.getMonth() + 1) + "/" + rawDate.getDate() + " at " + (rawDate.getHours() + 1);
      } else {
        return moment(date).format(format)
      }
    },
    weekdayName: function(weekday) {
      if(weekday === 0) return "Sunday";
      if(weekday === 1) return "Monday";
      if(weekday === 2) return "Tuesday";
      if(weekday === 3) return "Wednesday";
      if(weekday === 4) return "Thursday";
      if(weekday === 5) return "Friday";
      if(weekday === 6) return "Saturday";
    }
  }
})
