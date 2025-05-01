'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// challenges
const sortParentEl = document.querySelector('.sort-box');

// let map, mape;
// workout class
let newData;
let sort = false;
let newcoords;
let lat, lng;
let marker;
class Workout {
  type;
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;
  constructor(coords, dis, dur) {
    this.coords = coords;
    this.distance = dis;
    this.duration = dur;
  }
  workoutDes() {
    // prettier - ignore
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
  click() {
    this.clicks++;
  }
}

class Run extends Workout {
  type = 'running';
  constructor(coords, dis, dur, cadence) {
    super(coords, dis, dur);
    this.cadence = cadence;
    this.calpace();
    this.workoutDes();
    // console.log(this.workoutDes());
  }

  calpace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycle extends Workout {
  type = 'cycling';
  constructor(coords, dis, dur, ele) {
    super(coords, dis, dur);
    this.elevation = ele;
    this.calspeed();
    this.workoutDes();
  }

  calspeed() {
    //
    this.speed = this.duration / (this.distance / 60);
    return this.speed;
  }
}

const run1 = new Run([29, -50], 5, 10, 150);
console.log(run1);
// //////////////////////////////////////////////////
// ///Application architecture

class App {
  #map;
  #mape;
  #workouts = [];
  #zoomLevel = 13;
  constructor() {
    this._getPosition();
    this._getLocalStorage();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveMarker.bind(this));
    sortParentEl.addEventListener('click', this._sortFun.bind(this));
    containerWorkouts.addEventListener('click', this._formReload.bind(this));
    containerWorkouts.addEventListener('click', this._deleteWorkout.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('cannot get your position');
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(position);
    console.log(
      `https://www.google.com/maps/@${latitude},${longitude},10z?entry=ttu`
    );
    // const cords = [latitude, longitude];
    this.#map = L.map('map').setView([latitude, longitude], this.#zoomLevel);

    L.tileLayer(
      'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      },
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(this.#map);
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapEvent) {
    this.#mape = mapEvent;
    // form.style.display = 'grid';
    // form.classList.remove('hidden');
    form.classList.toggle('hidden');
    form.classList.toggle('form-transition');
    inputDistance.focus();
  }
  _hideForm() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    inputDistance.focus();
    // form.style.display = 'none';
    // form.classList.add('hidden');
    form.classList.toggle('hidden');
    form.classList.toggle('form-transition');
    setTimeout(() => (form.style.display = 'grid'));
  }

  _toggleElevationField(e) {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    e.preventDefault();

    const correctNum = (...input) =>
      input.every(input => Number.isFinite(input));

    const positiveNum = (...input) => input.every(input => input > 0);

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    let workout;
    if (this.#mape) {
      //  { lat, lng } = this.#mape.latlng;
      console.log(this.#mape);
      lat = this.#mape.latlng.lat;
      lng = this.#mape.latlng.lng;
    } else {
      lat = newcoords[0];
      lng = newcoords[1];
    }

    if (type === 'running') {
      const cadence = +inputCadence.value;

      if (
        !correctNum(distance, duration, cadence) ||
        !positiveNum(distance, duration, cadence)
      )
        return alert('Please enter positive input!');
      workout = new Run([lat, lng], distance, duration, cadence);
      console.log(workout, workout.type);
    }

    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !correctNum(distance, duration, elevation) ||
        !positiveNum(distance, duration)
      )
        return alert('Please enter positive input!');
      workout = new Cycle([lat, lng], distance, duration, elevation);
      console.log(workout, workout.type);
    }
    if (this.#workouts.some(work => work.coords === workout.coords)) {
      console.log('already there id');
      this.#workouts.push(workout);
      this._renderMarker(workout);
      this._hideForm();
      this._setLocalStorage();
    } else {
      console.log('new id created');
      this.#workouts.push(workout);
      this._marker(workout);
      this._renderMarker(workout);
      this._hideForm();
      this._setLocalStorage();
    }
  }

  _marker(workout) {
    console.log(workout.coords);
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴'} ${workout.description}`
      )
      .openPopup();
  }
  _renderMarker(workout) {
    let html;
    html = `
  <li class="workout workout--${workout.type}" data-id=${workout.id}>
   <h2 class="workout__title">
   <span>${workout.description}</span> 
   <span class="setdltedt">
   <span class='workout__icon edit'>✏️</span>
   <span class='workout__icon delete'>🗑️</span>
   <span>
   </h2>
   
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;
    if (workout.type === 'running')
      html += `
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    <div class="workout__details">
      <span class="workout__icon">🦶🏻</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
  </li>`;
    if (workout.type === 'cycling')
      html += `
    <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevation}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>  `;

    form.insertAdjacentHTML('afterend', html);
  }
  _moveMarker(e) {
    if (!this.#map) return;
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    // here new objct finding from  array of created previous objts
    const newWorkout = this.#workouts.find(
      workout => workout.id === workoutEl.dataset.id
    );
    if (!newWorkout) return;
    console.log(newWorkout, this.#workouts);

    this.#map.setView(newWorkout.coords, this.#zoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    // now this is the present objt in this method 'newWorkout
    // newWorkout.click();
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    console.log(data);
    if (!data) return;

    this.#workouts = data;
    console.log(this.#workouts);
    this.#workouts.forEach(work => this._renderMarker(work));
  }
  resetLocal() {
    localStorage.removeItem('workouts');
    location.reload();
  }

  _sortFun(e) {
    if (!e) return;
    console.log(e.target);
    const eleVal = e.target
      .closest('.ele')
      .querySelector('.workout__value').textContent;
    console.log(eleVal);
    if (!eleVal) return;
    const li = document.querySelectorAll('.workout');
    if (li) {
      li.forEach(ele => containerWorkouts.removeChild(ele));
    }
    if (eleVal === 'distance') {
      console.log(this.#workouts);
      newData = this.#workouts.slice().sort((a, b) => a.distance - b.distance);
      console.log(newData);

      newData.forEach(work => this._renderMarker(work));
    }
    if (eleVal === 'duration') {
      console.log(this.#workouts);
      newData = this.#workouts.slice().sort((a, b) => a.duration - b.duration);
      console.log(newData);

      newData.forEach(work => this._renderMarker(work));
    }
  }
  _formReload(e) {
    const ele = e.target.closest('.edit');
    if (!ele) return;
    const parentele = ele.closest('.workout');
    const arrayId = parentele.dataset.id;
    let indx = this.#workouts.findIndex(obj => obj.id === arrayId);
    let newarr = this.#workouts[indx];
    newcoords = newarr.coords;
    console.log(newcoords);
    this._showForm();

    for (let i = 0; i < form.elements.length; i++) {
      if (form.elements[i].classList.contains('form__input--type')) {
        form.elements[i].value = newarr.type;
      }
      if (form.elements[i].placeholder === 'km') {
        form.elements[i].value = newarr.distance;
      }
      if (form.elements[i].placeholder === 'min') {
        form.elements[i].value = newarr.duration;
      }
      if (form.elements[i].placeholder === 'step/min') {
        console.log(form.elements[i], newarr.cadence);
        if (newarr.cadence) form.elements[i].value = newarr.cadence;
        else form.elements[i].value = '';
      }
      if (form.elements[i].placeholder === 'meters') {
        console.log(form.elements[i], newarr.elevation);
        if (newarr.elevation) form.elements[i].value = newarr.cadence;
        else form.elements[i].value = '';
      }
    }
    // parentele.style.display = 'none';
    // this.#workouts.splice(indx, 1);
  }
  _deleteWorkout(e) {
    console.log(e);
    const ele = e.target.closest('.delete');
    if (!ele) return;
    const parentele = ele.closest('.workout');
    const arrayId = parentele.dataset.id;
    parentele.style.display = 'none';
    console.log(parentele, arrayId);
    let indx = this.#workouts.findIndex(obj => obj.id === arrayId);
    console.log(indx, this.#workouts.length);
    this.#workouts.splice(indx, 1);
  }
}

const obj1 = new App();
// obj1._getPosition();
// obj1._loadMap();
