//=============================================================================
// LanguageManager.js
//=============================================================================

/*:
 * @plugindesc Adds multi-language support with language selection on the title screen.
 * @author Language System
 *
 * @param Default Language
 * @desc The default language to use. (zh or en)
 * @default zh
 *
 * @help
 * This plugin adds multi-language support to the game.
 * A language selection option is added to the title screen.
 * Language preference is saved automatically.
 *
 * Translation files should be placed in the data/ folder:
 * - data/Language_en.json (English translations)
 */

(function() {

    'use strict';

    var parameters = PluginManager.parameters('LanguageManager');
    var defaultLanguage = parameters['Default Language'] || 'zh';

    // =========================================================================
    // LanguageManager
    // =========================================================================

    window.LanguageManager = {
        _currentLanguage: defaultLanguage,
        _translations: null,
        _translationsApplied: false,
        _originalData: {},

        initialize: function() {
            var saved = localStorage.getItem('gameLanguage');
            if (saved) {
                this._currentLanguage = saved;
            }
            this.loadTranslations();
        },

        currentLanguage: function() {
            return this._currentLanguage;
        },

        setLanguage: function(lang) {
            this._currentLanguage = lang;
            localStorage.setItem('gameLanguage', lang);
        },

        loadTranslations: function() {
            if (this._currentLanguage === 'zh') return;

            // 优先检查嵌入式语言数据（web_patch.js 在 file:// 协议下嵌入的数据）
            var embeddedVarName = '$dataLanguage_Language_' + this._currentLanguage;
            if (window[embeddedVarName]) {
                this._translations = window[embeddedVarName];
                console.log('[LanguageManager] 使用嵌入式语言数据: ' + embeddedVarName);
                return;
            }

            var xhr = new XMLHttpRequest();
            var url = 'data/Language_' + this._currentLanguage + '.json';
            xhr.open('GET', url, false); // synchronous
            xhr.overrideMimeType('application/json');
            xhr.onload = function() {
                if (xhr.status < 400) {
                    LanguageManager._translations = JSON.parse(xhr.responseText);
                }
            };
            xhr.onerror = function() {
                console.warn('Failed to load translation file: ' + url);
            };
            xhr.send();
        },

        isLoaded: function() {
            return this._currentLanguage === 'zh' || this._translations !== null;
        },

        saveOriginalData: function() {
            if (this._originalData.actors) return; // already saved
            this._originalData.actors = $dataActors.map(function(a) {
                return a ? { name: a.name, nickname: a.nickname, profile: a.profile } : null;
            });
            this._originalData.items = $dataItems.map(function(a) {
                return a ? { name: a.name, description: a.description } : null;
            });
            this._originalData.skills = $dataSkills.map(function(a) {
                return a ? { name: a.name, description: a.description, message1: a.message1, message2: a.message2 } : null;
            });
            this._originalData.enemies = $dataEnemies.map(function(a) {
                return a ? { name: a.name } : null;
            });
            this._originalData.weapons = $dataWeapons.map(function(a) {
                return a ? { name: a.name, description: a.description } : null;
            });
            this._originalData.armors = $dataArmors.map(function(a) {
                return a ? { name: a.name, description: a.description } : null;
            });
            this._originalData.states = $dataStates.map(function(a) {
                return a ? { name: a.name, message1: a.message1, message2: a.message2, message3: a.message3, message4: a.message4, description: a.description } : null;
            });
            this._originalData.systemTerms = JSON.parse(JSON.stringify($dataSystem.terms));
            this._originalData.armorTypes = $dataSystem.armorTypes ? $dataSystem.armorTypes.slice() : null;
            this._originalData.elements = $dataSystem.elements ? $dataSystem.elements.slice() : null;
            this._originalData.equipTypes = $dataSystem.equipTypes ? $dataSystem.equipTypes.slice() : null;
            this._originalData.skillTypes = $dataSystem.skillTypes ? $dataSystem.skillTypes.slice() : null;
            this._originalData.weaponTypes = $dataSystem.weaponTypes ? $dataSystem.weaponTypes.slice() : null;
        },

        restoreOriginalData: function() {
            if (!this._originalData.actors) return;

            var restore = function(data, original, fields) {
                for (var i = 1; i < data.length; i++) {
                    if (data[i] && original[i]) {
                        fields.forEach(function(f) {
                            if (original[i][f] !== undefined) data[i][f] = original[i][f];
                        });
                    }
                }
            };

            restore($dataActors, this._originalData.actors, ['name', 'nickname', 'profile']);
            restore($dataItems, this._originalData.items, ['name', 'description']);
            restore($dataSkills, this._originalData.skills, ['name', 'description', 'message1', 'message2']);
            restore($dataEnemies, this._originalData.enemies, ['name']);
            restore($dataWeapons, this._originalData.weapons, ['name', 'description']);
            restore($dataArmors, this._originalData.armors, ['name', 'description']);
            restore($dataStates, this._originalData.states, ['name', 'message1', 'message2', 'message3', 'message4', 'description']);

            // Restore system terms
            var ot = this._originalData.systemTerms;
            if (ot) {
                $dataSystem.terms.basic = ot.basic.slice();
                $dataSystem.terms.commands = ot.commands.slice();
                $dataSystem.terms.params = ot.params.slice();
                if (ot.messages) {
                    Object.keys(ot.messages).forEach(function(key) {
                        $dataSystem.terms.messages[key] = ot.messages[key];
                    });
                }
            }
            // Restore system arrays (stored on $dataSystem, not in terms)
            if (this._originalData.armorTypes) $dataSystem.armorTypes = this._originalData.armorTypes.slice();
            if (this._originalData.elements) $dataSystem.elements = this._originalData.elements.slice();
            if (this._originalData.equipTypes) $dataSystem.equipTypes = this._originalData.equipTypes.slice();
            if (this._originalData.skillTypes) $dataSystem.skillTypes = this._originalData.skillTypes.slice();
            if (this._originalData.weaponTypes) $dataSystem.weaponTypes = this._originalData.weaponTypes.slice();

            // Restore event translations
            this.restoreOriginalEvents();

            this._translationsApplied = false;
        },

        applyTranslations: function() {
            if (this._translationsApplied) return;
            if (this._currentLanguage === 'zh') return;
            if (!this._translations) return;

            // Save original data first
            this.saveOriginalData();

            var t = this._translations;

            // Apply to Actors
            if (t.actors) {
                for (var id in t.actors) {
                    var actor = $dataActors[parseInt(id)];
                    var trans = t.actors[id];
                    if (actor && trans) {
                        if (trans.name) actor.name = trans.name;
                        if (trans.nickname) actor.nickname = trans.nickname;
                        if (trans.profile) actor.profile = trans.profile;
                    }
                }
            }

            // Apply to Items
            if (t.items) {
                for (var id in t.items) {
                    var item = $dataItems[parseInt(id)];
                    var trans = t.items[id];
                    if (item && trans) {
                        if (trans.name) item.name = trans.name;
                        if (trans.description) item.description = trans.description;
                    }
                }
            }

            // Apply to Skills
            if (t.skills) {
                for (var id in t.skills) {
                    var skill = $dataSkills[parseInt(id)];
                    var trans = t.skills[id];
                    if (skill && trans) {
                        if (trans.name) skill.name = trans.name;
                        if (trans.description) skill.description = trans.description;
                        if (trans.message1 !== undefined) skill.message1 = trans.message1;
                        if (trans.message2 !== undefined) skill.message2 = trans.message2;
                    }
                }
            }

            // Apply to Enemies
            if (t.enemies) {
                for (var id in t.enemies) {
                    var enemy = $dataEnemies[parseInt(id)];
                    var trans = t.enemies[id];
                    if (enemy && trans) {
                        if (trans.name) enemy.name = trans.name;
                    }
                }
            }

            // Apply to Weapons
            if (t.weapons) {
                for (var id in t.weapons) {
                    var weapon = $dataWeapons[parseInt(id)];
                    var trans = t.weapons[id];
                    if (weapon && trans) {
                        if (trans.name) weapon.name = trans.name;
                        if (trans.description) weapon.description = trans.description;
                    }
                }
            }

            // Apply to Armors
            if (t.armors) {
                for (var id in t.armors) {
                    var armor = $dataArmors[parseInt(id)];
                    var trans = t.armors[id];
                    if (armor && trans) {
                        if (trans.name) armor.name = trans.name;
                        if (trans.description) armor.description = trans.description;
                    }
                }
            }

            // Apply to States
            if (t.states) {
                for (var id in t.states) {
                    var state = $dataStates[parseInt(id)];
                    var trans = t.states[id];
                    if (state && trans) {
                        if (trans.name) state.name = trans.name;
                        if (trans.message1) state.message1 = trans.message1;
                        if (trans.message2) state.message2 = trans.message2;
                        if (trans.message3) state.message3 = trans.message3;
                        if (trans.message4) state.message4 = trans.message4;
                        if (trans.description) state.description = trans.description;
                    }
                }
            }

            // Apply System terms
            if (t.system) {
                this.applySystemTranslations(t.system);
            }

            // Apply Event translations
            if (t.events) {
                this.applyEventTranslations(t.events);
            }

            this._translationsApplied = true;
        },

        applySystemTranslations: function(sys) {
            var terms = $dataSystem.terms;

            if (sys.basic) {
                for (var i = 0; i < sys.basic.length; i++) {
                    if (sys.basic[i] !== null && sys.basic[i] !== undefined) {
                        terms.basic[i] = sys.basic[i];
                    }
                }
            }

            if (sys.commands) {
                for (var i = 0; i < sys.commands.length; i++) {
                    if (sys.commands[i] !== null && sys.commands[i] !== undefined) {
                        terms.commands[i] = sys.commands[i];
                    }
                }
            }

            if (sys.params) {
                for (var i = 0; i < sys.params.length; i++) {
                    if (sys.params[i] !== null && sys.params[i] !== undefined) {
                        terms.params[i] = sys.params[i];
                    }
                }
            }

            if (sys.messages) {
                Object.keys(sys.messages).forEach(function(key) {
                    if (sys.messages[key]) {
                        terms.messages[key] = sys.messages[key];
                    }
                });
            }

            if (sys.armorTypes) {
                for (var i = 0; i < sys.armorTypes.length; i++) {
                    if (sys.armorTypes[i]) $dataSystem.armorTypes[i] = sys.armorTypes[i];
                }
            }

            if (sys.elements) {
                for (var i = 0; i < sys.elements.length; i++) {
                    if (sys.elements[i]) $dataSystem.elements[i] = sys.elements[i];
                }
            }

            if (sys.equipTypes) {
                for (var i = 0; i < sys.equipTypes.length; i++) {
                    if (sys.equipTypes[i]) $dataSystem.equipTypes[i] = sys.equipTypes[i];
                }
            }

            if (sys.skillTypes) {
                for (var i = 0; i < sys.skillTypes.length; i++) {
                    if (sys.skillTypes[i]) $dataSystem.skillTypes[i] = sys.skillTypes[i];
                }
            }

            if (sys.weaponTypes) {
                for (var i = 0; i < sys.weaponTypes.length; i++) {
                    if (sys.weaponTypes[i]) $dataSystem.weaponTypes[i] = sys.weaponTypes[i];
                }
            }
        },

        applyEventTranslations: function(events) {
            if (!events) return;

            // Save original CommonEvents before first translation
            if (!this._originalData.commonEvents) {
                this._originalData.commonEvents = JSON.parse(JSON.stringify($dataCommonEvents));
            }

            // Translate CommonEvents
            if ($dataCommonEvents) {
                this.translateEventList($dataCommonEvents, events);
            }

            // Translate currently loaded map data
            if ($dataMap && $dataMap.events) {
                this.translateEventList($dataMap.events, events);
            }
        },

        translateEventList: function(eventArray, translations) {
            if (!eventArray) return;
            for (var i = 0; i < eventArray.length; i++) {
                var event = eventArray[i];
                if (!event) continue;
                if (event.pages) {
                    for (var p = 0; p < event.pages.length; p++) {
                        var page = event.pages[p];
                        if (page && page.list) {
                            this.translateCommands(page.list, translations);
                        }
                    }
                }
                if (event.list) {
                    this.translateCommands(event.list, translations);
                }
            }
        },

        translateCommands: function(commandList, translations) {
            // Text command codes: 401 (show text), 405 (scrolling text), 102 (choices), 402 (choice branch)
            var textCodes = [401, 405];
            var choiceCodes = [102, 402];

            for (var i = 0; i < commandList.length; i++) {
                var cmd = commandList[i];
                if (!cmd || !cmd.parameters) continue;

                if (textCodes.indexOf(cmd.code) >= 0) {
                    // Single text line: parameters[0] is the text
                    if (cmd.parameters[0] && translations[cmd.parameters[0]] !== undefined) {
                        cmd.parameters[0] = translations[cmd.parameters[0]];
                    }
                } else if (cmd.code === 102) {
                    // Show Choices: parameters[0] is array of choice strings
                    if (Array.isArray(cmd.parameters[0])) {
                        for (var j = 0; j < cmd.parameters[0].length; j++) {
                            var choice = cmd.parameters[0][j];
                            if (choice && translations[choice] !== undefined) {
                                cmd.parameters[0][j] = translations[choice];
                            }
                        }
                    }
                } else if (cmd.code === 402) {
                    // Choice branch: parameters[1] is the choice text
                    if (cmd.parameters[1] && translations[cmd.parameters[1]] !== undefined) {
                        cmd.parameters[1] = translations[cmd.parameters[1]];
                    }
                }
            }
        },

        restoreOriginalEvents: function() {
            if (!this._originalData.commonEvents) return;

            // Restore CommonEvents
            var origCE = this._originalData.commonEvents;
            for (var i = 0; i < origCE.length; i++) {
                if (origCE[i] && $dataCommonEvents[i]) {
                    $dataCommonEvents[i] = JSON.parse(JSON.stringify(origCE[i]));
                }
            }

            this._originalData.commonEvents = null;
        }
    };

    // Initialize
    LanguageManager.initialize();

    // =========================================================================
    // Hook into DataManager - apply translations after database loads
    // =========================================================================

    var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function() {
        var result = _DataManager_isDatabaseLoaded.call(this);
        if (result && !LanguageManager._translationsApplied) {
            LanguageManager.applyTranslations();
        }
        return result;
    };

    // Hook into map loading to translate map events
    var _DataManager_onLoad = DataManager.onLoad;
    DataManager.onLoad = function(object) {
        _DataManager_onLoad.call(this, object);
        // When a map is loaded, translate its events
        if (object === $dataMap && LanguageManager._currentLanguage !== 'zh' && LanguageManager._translations && LanguageManager._translations.events) {
            if ($dataMap.events) {
                LanguageManager.translateEventList($dataMap.events, LanguageManager._translations.events);
            }
        }
    };

    // =========================================================================
    // Window_LanguageSelect - Language selection window
    // =========================================================================

    function Window_LanguageSelect() {
        this.initialize.apply(this, arguments);
    }

    Window_LanguageSelect.prototype = Object.create(Window_Command.prototype);
    Window_LanguageSelect.prototype.constructor = Window_LanguageSelect;

    Window_LanguageSelect.prototype.initialize = function() {
        Window_Command.prototype.initialize.call(this, 0, 0);
        this.close();
        this.hide();
        this.setHandler('cancel', this.onCancel.bind(this));
    };

    Window_LanguageSelect.prototype.windowWidth = function() {
        return 240;
    };

    Window_LanguageSelect.prototype.maxCols = function() {
        return 1;
    };

    Window_LanguageSelect.prototype.updatePlacement = function() {
        this.x = (Graphics.boxWidth - this.width) / 2;
        this.y = (Graphics.boxHeight - this.height) / 2;
    };

    Window_LanguageSelect.prototype.makeCommandList = function() {
        this.addCommand('中文', 'lang_zh');
        this.addCommand('English', 'lang_en');
    };

    Window_LanguageSelect.prototype.onCancel = function() {
        this.close();
        this.hide();
        this.deactivate();
        this._parentWindow.open();
        this._parentWindow.show();
        this._parentWindow.activate();
    };

    // =========================================================================
    // Window_TitleCommand - Add Language command
    // =========================================================================

    var _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function() {
        _Window_TitleCommand_makeCommandList.call(this);
        this.addCommand('Language', 'language');
    };

    // =========================================================================
    // Scene_Title overrides
    // =========================================================================

    var _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        _Scene_Title_createCommandWindow.call(this);
        this._commandWindow.setHandler('language', this.commandLanguage.bind(this));
        this.createLanguageWindow();
    };

    Scene_Title.prototype.commandLanguage = function() {
        this._commandWindow.close();
        this._commandWindow.deactivate();
        this._languageWindow.updatePlacement();
        this._languageWindow.show();
        this._languageWindow.open();
        this._languageWindow.activate();
        this._languageWindow.select(0);
    };

    Scene_Title.prototype.createLanguageWindow = function() {
        this._languageWindow = new Window_LanguageSelect();
        this._languageWindow.setHandler('lang_zh', this.onLanguageSelect.bind(this, 'zh'));
        this._languageWindow.setHandler('lang_en', this.onLanguageSelect.bind(this, 'en'));
        this._languageWindow._parentWindow = this._commandWindow;
        this.addWindow(this._languageWindow);
    };

    Scene_Title.prototype.onLanguageSelect = function(lang) {
        if (LanguageManager._currentLanguage !== lang) {
            if (lang === 'zh') {
                LanguageManager.restoreOriginalData();
            }
            LanguageManager.setLanguage(lang);
            if (lang !== 'zh') {
                LanguageManager.loadTranslations();
                LanguageManager.applyTranslations();
            }
            // Refresh the title screen
            SceneManager.goto(Scene_Title);
        } else {
            this._languageWindow.close();
            this._languageWindow.hide();
            this._languageWindow.deactivate();
            this._commandWindow.open();
            this._commandWindow.show();
            this._commandWindow.activate();
        }
    };

})();
