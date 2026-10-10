var gm_init_old = Game_Map.prototype.initialize;
Game_Map.prototype.initialize = function() {
    gm_init_old.call(this);
    this.adamdata = {
        user_states: {
            // 1: 3,
            // 2: 5,
            // 7: 3
        },
    };
};

Game_Map.prototype.randomskill = function(varstart,varend,valuestart,valueend){
    var random = [];
    for(var i = varstart; i <= varend; i++){
        var random_value = Math.floor(Math.random() * (valueend - valuestart + 1)) + valuestart;
        while(random.includes(random_value)){
            random_value = Math.floor(Math.random() * (valueend - valuestart + 1)) + valuestart;
        }
        random.push(random_value);
        $gameVariables.setValue(i, random_value);
    }
}

Game_Map.prototype.randomenemy = function(max_enemy_id = 55,var_id = 50) { 
    var limit_enemy_id = Math.min($gameActors.actor(1).level+1, max_enemy_id);
    var enemy_id = Math.floor(Math.random() * (limit_enemy_id - 1 + 1)) + 1;
    $gameVariables.setValue(var_id, enemy_id);
};

Game_Map.prototype.addstate = function(stateId) { 
    if(!this.adamdata.user_states[stateId]){
        this.adamdata.user_states[stateId] = 1;
    }else{
        this.adamdata.user_states[stateId]++;
    }
};


Game_Map.prototype.get_enemy_states = function(type=0, Slant=0){
    var enemy_states = {};
    //计算玩家状态的总和
    var stats_value_sum = 0;
    var this1 = this;
    Object.keys(this.adamdata.user_states).forEach(function(key) {
        var value = this1.adamdata.user_states[key];
        stats_value_sum += value;
    });
    //获取随机等级分散(1-3)
    var level_round = Math.floor(Math.random() * 5) + 1;
    if(type>0){
        //精英
        level_round += 5;
        if(type>1){
            //boss
            level_round += 5;
            if(type>2){
                //最终boss
                level_round += 5;
            }
        }
    }
    //随机生成敌人状态
    var state_left = stats_value_sum+level_round;
    if(Slant>0){
        var keys = Object.keys(this.adamdata.user_states); // 获取对象所有的键组成的数组
        var randomKey = keys[Math.floor(Math.random() * keys.length)]; // 随机选择一个键
    }
    for(var i = 1; i <= state_left; i++){
        //随机生成状态（11到22键值）
        var state_id = Math.floor(Math.random() * 12) + 11;
        //随机生成状态值（1到剩余的值）
        var state_value = Math.floor(Math.random() * state_left) + 1;
        enemy_states[state_id] = state_value;
        state_left -= state_value;
    }
    //console.log(enemy_states);
    return enemy_states;
}


//召唤复制的敌人
Game_Map.prototype.summonSealEnemy = function() { 
    var enemyid = $gameTroop.members()[0]._enemyId;
    console.log(enemyid);
    var level = Math.min(Math.floor($gameParty.members()[0].mat/5),99);
    console.log(level);
    var max_actorid = $dataActors.length;
    var enemy_info1 = $dataEnemies[enemyid];
    var actor_id = 0;
    var is_exist = false;
    var enemy_info = enemy_info1;
    //判断是否已存在该敌人
    for(var i=1;i<max_actorid;i++){
        //console.log($dataActors[i].name, enemy_info1.name+'_summon');
        if($dataActors[i].name == enemy_info1.name+'_summon'){
            is_exist = true;
            //是否已经召唤过了
            if($gameParty.members().contains($gameActors.actor(i))){
                $gameActors.actor(i).gainHp(level*10);
                //alert('已经召唤过了');
                return;
            }else{
                actor_id = $dataActors[i].id;
                break;
            }
        }
    }
    if(!is_exist){
        var param_class = [];
        enemy_info.mhp = enemy_info1.params[0];
        enemy_info.mmp = enemy_info1.params[1];
        enemy_info.atk = enemy_info1.params[2];
        enemy_info.def = enemy_info1.params[3];
        enemy_info.mat = enemy_info1.params[4];
        enemy_info.mdf = enemy_info1.params[5];
        enemy_info.agi = enemy_info1.params[6];
        enemy_info.luk = enemy_info1.params[7];
        var hp_infos = [1,enemy_info.mhp];
        var mp_infos = [0,enemy_info.mmp];
        var atk_infos = [1,enemy_info.atk];
        var def_infos = [0,enemy_info.def];
        var mat_infos = [0,enemy_info.mat];
        var mdf_infos = [0,enemy_info.mdf];
        var agi_infos = [0,enemy_info.agi];
        var luk_infos = [0,enemy_info.luk];
        for(var lv = 2;lv<100;lv++)
        {
            hp_infos.push(enemy_info.mhp+Math.floor(enemy_info.mhp*((lv-1)*0.15))+(50*(lv-1)));
            mp_infos.push(enemy_info.mmp+Math.floor(enemy_info.mmp*((lv-1)*0.1))+(10*(lv-1)));
            atk_infos.push(enemy_info.atk+Math.floor(enemy_info.atk*((lv-1)*0.05))+Math.floor(2.5*(lv-1)));
            def_infos.push(enemy_info.def+Math.floor(enemy_info.def*((lv-1)*0.05))+Math.floor(2.5*(lv-1)));
            mat_infos.push(enemy_info.mat+Math.floor(enemy_info.mat*((lv-1)*0.05))+Math.floor(2.5*(lv-1)));
            mdf_infos.push(enemy_info.mdf+Math.floor(enemy_info.mdf*((lv-1)*0.05))+Math.floor(2.5*(lv-1)));
            agi_infos.push(enemy_info.agi+Math.floor(enemy_info.agi*((lv-1)*0.15))+(10*(lv-1)));
            luk_infos.push(enemy_info.luk+Math.floor(enemy_info.luk*((lv-1)*0.15))+(10*(lv-1)));
        }
        param_class = [hp_infos,mp_infos,atk_infos,def_infos,mat_infos,mdf_infos,agi_infos,luk_infos];
        var max_classid = $dataClasses.length;
        var class_info = {
            "id":max_classid,
            "expParams":[30,20,30,30],
            "traits":enemy_info.traits,
            "learnings":[],
            "name":enemy_info.name,
            "note":"",
            "params":param_class
        }
        var temp_class = $dataClasses[1];
        var new_class_info = {...temp_class, ...class_info};
        $dataClasses.push(new_class_info);
        console.log(new_class_info);
        var actor_info = {
            "id":max_actorid,
            "battlerName":"",//enemy_info.battlerName,
            "characterIndex":1,//enemy_info.meta.movepicindex,//行走图索引
            "characterName":'Monster',//enemy_info.name,
            "classId":max_classid,
            "equips":[0,0,0,0,0],
            "faceIndex":0,//enemy_info.meta.facepicindex,//lian图索引
            "faceName":'Monster',//enemy_info.meta.faceName,
            "traits":[{"code":62,"dataId":0,"value":1}],
            "initialLevel":$gameVariables.value(3001),
            "maxLevel":99,
            "name":enemy_info.name+'_summon',
            "nickname":"",
            "meta":{
                "axysingle":enemy_info.battlerName,
                "axysingle_scalex":1,
                "axysingle_scaley":1,
                "axysingle_rotation":0,
                "axysingle_hue":3,
                "isbattlesummon":1
            },
            "note":"<axysingle:"+enemy_info.battlerName+">\n<axysingle_scalex:1>\n<axysingle_scaley:1>\n<axysingle_rotation:0>\n<axysingle_hue:3>\n<isbattlesummon:1>",
            "profile":""
        }
        var temp_actor = $dataActors[1];
        var actor_info1 = {...temp_actor, ...actor_info};
        $dataActors.push(actor_info1);
        actor_id = max_actorid;
        console.log(actor_info1);
        console.log($dataActors[7]);
    }
    if(actor_id>0){
        $gameActors.actor(actor_id).setup(actor_id);
        //召唤等级
        $gameActors.actor(actor_id).changeLevel(level, false);
        $gameActors.actor(actor_id).recoverAll();
        $gameParty.addActor(actor_id);
        $gameActors.actor(actor_id).setStateCounter(51, 100);
        //console.log($gameParty.members());
    }else{
        alert("请检查是否已存在该召唤 Actor");
    }
};

//道具封印怪物
Game_Map.prototype.sealEnemy = function(enemyid,lv) { 
    console.log($dataItems[53]);
    var max_itemid = $dataItems.length;
    var enemy_info = $dataEnemies[enemyid];
    var item_new = {
        "id":max_itemid,
        "animationId":117,
        "consumable":true,
        "damage":{
            "critical":true,
            "elementId":-1,
            "formula":"a.mdf",
            "type":3,
            "variance":20
        },
        "description":"",
        "effects":[],
        "hitType":0,
        "iconIndex":191,
        "itypeId":1,
        "name":"封印卷轴（"+enemy_info.name+"_lv"+lv+"）",
        "note":"<ememy_id_summon:"+enemyid+">",
        "occasion":1,
        "price":10*lv,
        "repeats":1,
        "scope":7,
        "speed":0,
        "successRate":100,
        "tpGain":0,
        "customBeforeEval":"console.log('111');\n$gameVariables.setValue(3002,1);\n$gameMap.summonSealEnemy(item.meta.ememy_id_summon);\n",
        "meta":{
            "/Before Eval":true,
            "Before Eval":true,
            "ememy_id_summon":enemyid
        }
    };
    var temp_item = $dataItems[53];
    var item_new1 = {...temp_item, ...item_new};
    $dataItems.push(item_new1);
    $gameParty.gainItem($dataItems[item_new1.id], 1);
}