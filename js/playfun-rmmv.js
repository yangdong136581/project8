// Play.fun (OpenGameProtocol) integration for RPG Maker MV web build.
// Defensive: game still runs if the SDK fails to load. Points = battle victories.
(function () {
  var GAME_ID = '76a190bc-0eef-4f8d-8f3d-dda2ae9e01f0';
  var POINTS_PER_WIN = 20;
  var sdk = null, ready = false;

  function addPoints(n) { if (ready && sdk && sdk.addPoints && n > 0) { try { sdk.addPoints(n); } catch (e) {} } }
  function savePoints() { if (ready && sdk && sdk.savePoints) { try { sdk.savePoints(); } catch (e) {} } }

  function init() {
    var C = window.PlayFunSDK || window.OpenGameSDK;
    if (!C) { console.warn('Play.fun SDK not loaded - skipping monetization'); return; }
    try {
      sdk = new C({ gameId: GAME_ID, ui: { usePointsWidget: true } });
      var p = sdk.init();
      if (p && p.then) p.then(function () { ready = true; console.log('Play.fun SDK initialized'); },
                              function () { ready = false; });
      else ready = true;
    } catch (e) { console.warn('Play.fun init failed', e); }
  }

  function hook() {
    // battle victory -> buffer points
    if (window.BattleManager && BattleManager.processWin) {
      var ow = BattleManager.processWin;
      BattleManager.processWin = function () { ow.apply(this, arguments); addPoints(POINTS_PER_WIN); };
    }
    // game over -> submit buffered points (natural break point)
    if (window.Scene_Gameover && Scene_Gameover.prototype.start) {
      var og = Scene_Gameover.prototype.start;
      Scene_Gameover.prototype.start = function () { og.apply(this, arguments); savePoints(); };
    }
    window.addEventListener('beforeunload', savePoints);
  }

  init();
  hook();
})();
