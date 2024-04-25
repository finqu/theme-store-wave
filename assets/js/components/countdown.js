class Countdown {

    constructor(opts = {}) {
        this.settings = Object.assign({
            el: null,
            datetime: null,
            zeroPad: true,
            hideTimeUnitOnZero: false,
            showYears: false,
            showMonths: false,
            events: {
                complete: null
            }
        }, opts);

        if (!this.settings.datetime) {

            console.warn(`Countdown: Missing datetime.`);

            return;
        }

        this.el = this.settings.el;
        this.zeroPad = this.settings.zeroPad;
        this.hideTimeUnitOnZero = this.settings.hideTimeUnitOnZero;
        this.showYears = this.settings.showYears;
        this.showMonths = this.settings.showMonths;
        this.events = this.settings.events;
        this.targetDate = new Date(this.settings.datetime);
        this.currentDate = new Date();
        this.updateInterval = null;
        this.data = {
            years: 0,
            months: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };

        if (this.el) {
            this.yearsEl = this.el.querySelector('[data-countdown-years]');
            this.monthsEl = this.el.querySelector('[data-countdown-months]');
            this.daysEl = this.el.querySelector('[data-countdown-days]');
            this.hoursEl = this.el.querySelector('[data-countdown-hours]');
            this.minutesEl = this.el.querySelector('[data-countdown-minutes]');
            this.secondsEl = this.el.querySelector('[data-countdown-seconds]');
        }

        if (this.targetDate - this.currentDate > 0) {
            this.updateInterval = setInterval(this.update.bind(this), 1000);
        }

        return this;
    }

    update() {

        this.currentDate = new Date();

		const diff = this.targetDate - this.currentDate;

		if (diff < 1) {

            this.data.years = 0;
            this.data.months = 0;
            this.data.days = 0;
            this.data.hours = 0;
            this.data.minutes = 0;
            this.data.seconds = 0;

			clearInterval(this.updateInterval);

            if (typeof this.events.complete === 'function') {
                this.events.complete.call(this);
            }

		} else {

            if (this.showYears && this.showMonths) {

                this.data.years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
                this.data.months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
                this.data.days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
                this.data.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                this.data.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                this.data.seconds = Math.floor((diff % (1000 * 60)) / 1000);

            } else if (this.showYears) {

                this.data.years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
                this.data.days = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24));
                this.data.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                this.data.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                this.data.seconds = Math.floor((diff % (1000 * 60)) / 1000);

            } else if (this.showMonths) {

                this.data.months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
                this.data.days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
                this.data.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                this.data.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                this.data.seconds = Math.floor((diff % (1000 * 60)) / 1000);

            } else {
                
                this.data.days = Math.floor(diff / (1000 * 60 * 60 * 24));
                this.data.hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                this.data.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                this.data.seconds = Math.floor((diff % (1000 * 60)) / 1000);
            }
        }

        if (this.el) {
            this.render();
        }
    }

    render() {

        if (!this.el) {
            return;
        }

        const format = (num) => {
            return String((num < 10 && this.zeroPad) ? '0'+num : num);
        };

        if (this.yearsEl && this.showYears) {

            if (this.hideTimeUnitOnZero && this.data.years === 0) {
                this.yearsEl.parentNode.remove();
                this.yearsEl = null;
            } else {
                this.yearsEl.innerHTML = format(this.data.years);
            }
        }

        if (this.monthsEl && this.showMonths) {

            if (this.hideTimeUnitOnZero && this.data.months === 0) {
                this.monthsEl.parentNode.remove();
                this.monthsEl = null;
            } else {
                this.monthsEl.innerHTML = format(this.data.months);
            }
        }

        if (this.daysEl) {

            if (this.hideTimeUnitOnZero && this.data.days === 0) {
                this.daysEl.parentNode.remove();
                this.daysEl = null;
            } else {
                this.daysEl.innerHTML = format(this.data.days);
            }
        }

        if (this.hoursEl) {

            if (this.hideTimeUnitOnZero && this.data.hours === 0) {
                this.hoursEl.parentNode.remove();
                this.hoursEl = null;
            } else {
                this.hoursEl.innerHTML = format(this.data.hours);
            }
        }

        if (this.minutesEl) {

            if (this.hideTimeUnitOnZero && this.data.minutes === 0) {
                this.minutesEl.parentNode.remove();
                this.minutesEl = null;
            } else {
                this.minutesEl.innerHTML = format(this.data.minutes);
            }
        }

        if (this.secondsEl) {
            this.secondsEl.innerHTML = format(this.data.seconds);
        }
    }
}

export default Countdown;