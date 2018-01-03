var app = angular.module('Audrix')
  .controller('AudrixAppController', ['$scope', '$http',
    '$mdSidenav', '$rootScope', '$timeout', 'ConfigService', 'localStorageService', '$location', '$window',
    function($scope, $http, $mdSidenav, $rootScope, $timeout, ConfigService, localStorageService, $location, $window) {
      $scope.uri = ConfigService.getOrigApiUrl();
      $rootScope.token = localStorageService.get('token');

    }
  ])
  .controller('LoginController', ['$scope', '$http', 'ConfigService', 'localStorageService', '$location', '$rootScope', 'UserLoginService', '$auth',
    function($scope, $http, ConfigService, localStorageService, $location, $rootScope, UserLoginService, $auth) {

      $scope.message = '';
      $scope.error = '';
      $scope.uri = ConfigService.getOrigApiUrl();
      $scope.token = localStorageService.get('token');
      $scope.user = localStorageService.get('user');

      $scope.userSignup = function() {
        var params = {
          username: $scope.username,
          email: $scope.email,
          password: $scope.password,
          firstname: $scope.firstname,
          lastname: $scope.lastname,
        };

        $http.post($scope.uri + 'auth.signup', params)
          .success(function(response) {
            if (response.status) {
              if (typeof $scope.message !== undefined) {
                $scope.message = response.message;
                $location.path('/auth/login');
              }
            } else {
              if (typeof $scope.error !== undefined) {
                $scope.error = response.message;
              }
            }
          })
          .error(function(data) {
            if (typeof $scope.error !== undefined) {
              $scope.error = data.message;
            }
          });
      };

      $scope.loginSuccess = function(data) {
        localStorageService.set('token', data.token);
        localStorageService.set('user', {
          username: data.username,
          email: data.email,
        });
      };

      $scope.userLogin = function() {
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $scope.username + ':' + $scope.password;
        $http.get($scope.uri + 'auth.login')
          .success(function(response) {
            if (response.status) {
              $scope.loginSuccess(response.data);
              $location.path('/browse/');
            } else {
              $scope.error = response.message;

            }
          })
          .error(function(data) {});
      };

      $scope.authenticate = function(provider) {
        $auth.authenticate(provider).then(function(response) {
          $auth.removeToken();
          localStorageService.set('token', response.data.token);
          localStorageService.set('user', {
            username: response.data.username,
            email: response.data.email,
            fbId: response.data.fbId
          });
          $location.path('/browse/');
        });
      };

      $scope.userLogout = function() {
        localStorageService.clearAll();
        $http.post($scope.uri + 'auth.logout')
          .success(function(response) {
            if (response.status) {
              if (typeof $scope.message !== undefined) {
                $location.path('/');
              }
            } else {
              if (typeof $scope.error !== undefined) {
                $scope.error = response.message;
              }
            }
          })
          .error(function(data) {
            if (typeof $scope.error !== undefined) {
              $scope.error = data.message;
            }
          });
      };

      $scope.logout = function() {
        localStorageService.remove('token', 'user');
        $location.path('/auth/login');
      };

    }
  ])
  .controller('UserController', ['$scope', '$http', 'ConfigService', 'localStorageService', '$location', '$rootScope', '$timeout', '$routeParams',
    function($scope, $http, ConfigService, localStorageService, $location, $rootScope, $timeout, $routeParams) {

      $scope.token = localStorageService.get('token');
      $scope.user = localStorageService.get('user');
      $scope.username = $scope.user.username;
      $scope.fbProfile = false;

      if ($scope.user) {
        $scope.fbId = $scope.user.fbId;
        if ($scope.fbId) {
          $scope.fbProfile = true
        } else {
          $scope.fbProfile = false
        }
      }

      $scope.userLogout = function() {
        localStorageService.remove('token', 'user');
        $location.path('/auth/login');
      };

    }
  ])
  .controller('WebPlayerController', ['$scope', '$http', 'ConfigService', 'localStorageService', '$location', 'Upload', '$rootScope', '$timeout',
    function($scope, $http, ConfigService, localStorageService, $location, Upload, $rootScope, $timeout) {

      $scope.token = localStorageService.get('token');
      $scope.user = localStorageService.get('user');
      $scope.username = $scope.user.username;
      $scope.fbProfile = false;
      $scope.play = true;
      $scope.volumeOff = false;
      $scope.volumeUp = true;
      $scope.volumeDown = false;
      $scope.volumeMute = false;

      var music = document.querySelector('.music');
      var slider = document.querySelector('.progress-bar__slider');
      var sliderHead = document.querySelector('.slider-head');
      var timer = document.querySelector('.playback-bar__progress-time');
      var totalTime = document.querySelector('.playback-bar__total-progress-time');
      var timeline = document.querySelector('.progress-bar__bg');
      var timelineWidth = timeline.offsetWidth - slider.offsetWidth;

      var timelinev = document.querySelector('.progress-bar__bgv');
      var sliderv = document.querySelector('.progress-bar__sliderv');
      var timelineWidthv = timelinev.offsetWidth - sliderv.offsetWidth;

      sliderv.style.width = 100 + "%";

      var duration, songDuration, mediaTime;

      // -----------------------------------------------------------------
      // ----------- Functions for Volume Control ------------------------
      // -----------------------------------------------------------------

      timelinev.addEventListener("click", function(event) {
        var offset = timelinev.getClientRects()[0];
        var sliderOffset = sliderv.getClientRects()[0];
        var position = event.clientX - offset.left;
        var percentage = 100 * position / offset.width;
        music.volume = (percentage / 100).toFixed(2);
        sliderv.style.width = percentage + "%";

        if (music.volume === 0) {
          $scope.$apply(function() {
            $scope.volumeOff = true;
            $scope.volumeUp = false;
            $scope.volumeDown = false;
          })
        } else if (music.volume > 0.5) {
          $scope.$apply(function() {
            $scope.volumeUp = true;
            $scope.volumeDown = false;
            $scope.volumeOff = false;
          })
        } else if (music.volume < 0.5) {
          $scope.$apply(function() {
            $scope.volumeDown = true;
            $scope.volumeUp = false;
            $scope.volumeOff = false;
          })
        } else {
          $scope.$apply(function() {
            $scope.volumeMute = true;
          })
        }
      }, false);

      sliderv.addEventListener('mousedown', mouseDownv, false);
      sliderv.addEventListener('mouseup', mouseUpv, false);
      // Boolean value so that audio position is updated only when the playhead is released
      var onvolumehead = false;

      function mouseDownv() {
        onvolumehead = true;
        // music.removeEventListener('timeupdate', timeUpdate, true)
        sliderv.addEventListener('mousemove', movevolumehead, true);
        // music.addEventListener('timeupdate', timeUpdate, false);
      }

      function mouseUpv(event) {
        if (onvolumehead == true) {
          // moveplayhead(event);
          sliderv.removeEventListener('mousemove', movevolumehead, true);
          // change current time
          var offset = timelinev.getClientRects()[0];
          var sliderOffset = sliderv.getClientRects()[0];
          var position = event.clientX - offset.left;
          var percentage = 100 * position / offset.width;
          music.volume = (percentage / 100).toFixed(1);
          sliderv.style.width = percentage + "%";

          // var d = music.duration / offset.width;
          // music.currentTime = (event.clientX - offset.left) * d;
        }
        onvolumehead = false;
      }

      function movevolumehead(event) {
        var offset = timelinev.getClientRects()[0];
        var sliderOffset = sliderv.getClientRects()[0];
        var position = Math.floor(event.clientX - offset.left);
        var percentage = (100 * position / offset.width).toFixed(0);
        sliderv.style.width = percentage + "%";
      }

      function getPosition(el) {
        return el.getBoundingClientRect().left;
      }

      // -----------------------------------------------------------------
      // ----------- Functions for Music Control ------------------------
      // -----------------------------------------------------------------

      music.addEventListener("timeupdate", timeUpdate, false);
      music.addEventListener("canplaythrough", function() {
        duration = music.duration;
        var minutes = Math.floor(duration / 60);
        var seconds = Math.floor(duration - minutes * 60);
        var minuteValue;
        var secondValue;

        if (minutes < 10) {
          minuteValue = '0' + minutes;
        } else {
          minuteValue = minutes;
        }

        if (seconds < 10) {
          secondValue = '0' + seconds;
        } else {
          secondValue = seconds;
        }

        songDuration = minuteValue + ':' + secondValue;
        totalTime.textContent = songDuration;
      })

      music.addEventListener("ended", function() {
        slider.style.width = 0;
        timer.textContent = '00:00';
        $scope.$apply(function() {
          $scope.play = true;
        })
      })

      function timeUpdate() {
        var minutes = Math.floor(music.currentTime / 60);
        var seconds = Math.floor(music.currentTime - minutes * 60);
        var minuteValue;
        var secondValue;

        if (minutes < 10) {
          minuteValue = '0' + minutes;
        } else {
          minuteValue = minutes;
        }

        if (seconds < 10) {
          secondValue = '0' + seconds;
        } else {
          secondValue = seconds;
        }

        mediaTime = minuteValue + ':' + secondValue;
        timer.textContent = mediaTime;

        var barLength = 100 * (music.currentTime / music.duration);
        slider.style.width = barLength + '%';
      }

      timeline.addEventListener("click", function(event) {
        moveplayhead(event);
        var offset = this.getClientRects()[0];
        var sliderOffset = slider.getClientRects()[0];
        var d = music.duration / offset.width;
        if ((event.clientX - offset.left) > 0) {
          music.currentTime = (event.clientX - offset.left) * d;
        }
      }, false);

      // makes playhead draggable
      slider.addEventListener('mousedown', mouseDown, false);
      window.addEventListener('mouseup', mouseUp, false);
      // Boolean value so that audio position is updated only when the playhead is released
      var onplayhead = false;

      function mouseDown() {
        onplayhead = true;
        // music.removeEventListener('timeupdate', timeUpdate, true)
        window.addEventListener('mousemove', moveplayhead, true);
        // music.addEventListener('timeupdate', timeUpdate, false);
      }

      function mouseUp(event) {
        if (onplayhead == true) {
          // moveplayhead(event);
          window.removeEventListener('mousemove', moveplayhead, true);
          // change current time
          var offset = timeline.getClientRects()[0];
          var sliderOffset = slider.getClientRects()[0];
          var d = music.duration / offset.width;
          music.currentTime = (event.clientX - offset.left) * d;
          music.addEventListener('timeupdate', timeUpdate, false);
        }
        onplayhead = false;
      }

      function moveplayhead(event) {
        var offset = timeline.getClientRects()[0];
        var sliderOffset = slider.getClientRects()[0];
        var d = music.duration / offset.width;
        var newSliderWidth = (event.clientX - offset.left);
        if (newSliderWidth >= 0 && newSliderWidth <= timelineWidth) {
          slider.style.width = newSliderWidth + "px";
        }
        if (newSliderWidth < 0) {
          slider.style.width = "0px";
        }
        if (newSliderWidth > timelineWidth) {
          slider.style.width = timelineWidth + "px";
        }
      }

      function getPosition(el) {
        return el.getBoundingClientRect().left;
      }

      $scope.playAudio = function() {
        if (music.paused) {
          music.play();
          // $scope.pause = true;
          $scope.play = false;
        } else {
          music.pause();
          // $scope.pause = false;
          $scope.play = true;
        }

      }

      if ($scope.user) {
        $scope.fbId = $scope.user.fbId;
        if ($scope.fbId) {
          $scope.fbProfile = true
        } else {
          $scope.fbProfile = false
        }
      }

      $scope.userLogout = function() {
        localStorageService.remove('token', 'user');
        $location.path('/auth/login');
      };

    }
  ])

  .controller('Controller', ['$scope', '$http', 'ConfigService', 'localStorageService', '$location',
    function($scope, $http, ConfigService, localStorageService, $location) {

    }
  ]);
