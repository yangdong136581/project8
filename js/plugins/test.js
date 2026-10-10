//<Counter Skills: 32>
//<Custom Battle Effect>
var states = {};
if (user.isActor()){
    states = $gameMap.adamdata.user_states;
    //封印师初始是指护盾
    if(user._classId== 6){
        user.addState(97);
    }
}else{
    states = $gameMap.get_enemy_states();
}
var state_max_id = $dataStates.length;
var new_state = {
    "id":state_max_id,
    "autoRemovalTiming":0,
    "chanceByDamage":100,
    "traits":[],
    "iconIndex":16,
    "maxTurns":1,
    "message1":"",
    "message2":"",
    "message3":"",
    "message4":"",
    "minTurns":1,
    "motion":0,
    "name":"叠加buff",
    "note":"",
    "overlay":0,
    "priority":50,
    "removeAtBattleEnd":true,
    "removeByDamage":false,
    "removeByRestriction":false,
    "removeByWalking":false,
    "restriction":0,
    "stepsToRemove":100
}
var state_old = {};
var state_num = states.length;
Object.keys(states).forEach(function(key) {
    var value = states[key];
    user.addState(key);
    user.setStateCounter(key, value);
    var state = $dataStates[key];
    state_old = state;
    for(var i = 1; i <= value; i++)
    {
        if((key>=11&&key<=20)||(key>=23&&key<=28)){
            new_state.traits.push(state.traits[0]);
            //state.traits = [];
        }
    }
});
var new_state1 = {...state_old, ...new_state};
$dataStates.push(new_state1);
user.addState(state_max_id);
user.setStateCounter(state_max_id, state_num);
//</Custom Battle Effect>

//统一设置
//<Custom React Effect>
if(value>0){
    //检查攻击方是否为角色
    if(attacker.isActor()){
        var class_id = attacker._classId;
        console.log('职业id:'+class_id);
        switch(class_id){
            case 1:
                //战士
                break;
            case 2:
                //骑士
                break;
            case 3:
                //魔法师
                break;
            case 4:
                //僧侣
                break;
            case 5:
                //幻术师
                break;
            case 6:
                //封印师
                break;
            case 7:
                //刺客
                //1-3回合流血效果
                var blood_count = Math.floor(Math.random()) + 3;
                if(defender.isStateAffected(52)){
                    defender._stateTurns[52] += blood_count;
                }else{
                    defender.addState(52);
                    defender._stateTurns[52] = blood_count;
                }
                console.log('流血效果已应用');
                break;
        }
    }
}
//</Custom React Effect>


//法力护盾
//<Custom React Effect>
var statelevel = user.getStateCounter(stateId);
for(var i = 1; i <= statelevel; i++)
{
    value = value*0.99;
}
value = Math.floor(value);
if(value<defender.mp){
    defender.gainMp(-value);
    value = 0;
    defender.startAnimation(200);
}else{
    defender.gainMp(-defender.mp);
    value -= defender.mp;
}
//</Custom React Effect>

//反伤
//<Custom React Effect>
if(value>0){
    var statelevel = defender.getStateCounter(stateId);
    var value1 = value;
    for(var i = 1; i <= statelevel; i++)
    {
        value1 += value1*0.01;
    }
    value1 = Math.floor(value1);
    console.log(value1);
    if(value1>this.subject().def){
        this.executeDamage(this.subject(),value1-this.subject().def);
        defender.startAnimation(198);
    }
}
//</Custom React Effect>


//魔法护盾
//<Custom User Barrier>
value = user.mat*2;
//</Custom User Barrier>


//时之护盾
//<Custom React Effect>
if(value>0){
  //收到攻击会增加回合的状态
  var attacked_add_turn_state = [97,98];
  console.log(defender);
  if(defender._sumvalue>0){
      console.log(this);
      console.log(defender._stateTurns[stateId]);
        defender._sumvalue += value;
    }else{
      defender._sumvalue = value;
    }
    //defender.gainMp(-value);
    value =  0;
    if(attacked_add_turn_state.includes(stateId)){
      defender._stateTurns[stateId] += 1;
    }
    defender.setStateCounter(stateId, defender._sumvalue);
console.log(defender._sumvalue);
  }
//</Custom React Effect>

//<Custom Turn End Effect>
console.log(this);
//console.log(user);
//console.log(user._sumvalue);
if(user._sumvalue>0){
  var current_value = Math.floor(user._sumvalue/(user._stateTurns[stateId]-1));
  user._sumvalue -= current_value;
  //this.executeDamage(user,current_value);
  user.startAnimation(106);
  user.gainHp(-current_value);
  if (current_value > 0) {
      user.onDamage(current_value);
      user.startDamagePopup();
  }
  if (user.isDead()) {
      user.performCollapse();
  }
}
//</Custom Turn End Effect>

//<Custom Remove Effect>
this._sumvalue = 0;
//</Custom Remove Effect>



var num1 = $gameVariables.value(13) / 10
if(Math.floor(num1) === num1){
    // $gameParty.members().forEach(function(actor) {
    //     actor.gainHp(-num1*num1*$gameVariables.value(11));
    // });
    // $gameTroop.members().forEach(function(enemy) {
    //     enemy.gainHp(-num1*num1*$gameVariables.value(11));
    // });
    console.log(num1*num1*$gameVariables.value(11))
    $gameVariables.setValue(14, $gameVariables.value(13)*$gameVariables.value(13)*$gameVariables.value(11));
}


(Math.floor($gameVariables.value(13) / 10) === $gameVariables.value(13) / 10)

//不死族
//<Custom Battle Effect>
user.addState(3);
user.setStateCounter(stateId, 5);
//</Custom Battle Effect>

//<Custom Respond Effect>
    if(defender._hp<=0){
        console.log('死亡状态：'+defender.getStateCounter(stateId));
        var counter = defender.getStateCounter(stateId);
        if(counter>0){
            defender.setStateCounter(stateId,counter-1);
        }else{
            defender.removeState(3);
        }
    }
//</Custom Respond Effect>


//流血效果
//流血效果
//<Custom Apply Effect>
if(user.getStateCounter(stateId)!=undefined){
  user.setStateCounter(stateId, user.getStateCounter(stateId)+1);
  user._stateTurns[stateId] += 1;
}else{
  user.setStateCounter(stateId, 1);
  user._stateTurns[stateId] += 1;
}
//</Custom Apply Effect>
//<Custom Turn End Effect>
if(user.getStateCounter(stateId)>0){
  user.setStateCounter(stateId, user.getStateCounter(stateId)-1);
  user._stateTurns[stateId] += 1;
}
//</Custom Turn End Effect>

//<Custom Remove Effect>
user.setStateCounter(stateId, 0);
//</Custom Remove Effect>


//<Custom DoT Formula>
       value = a.atk;
       variance = 10;
       element = 1;
//</Custom DoT Formula>


//法力护盾

//<Custom React Effect>
if(value>0){
    var statelevel = user.getStateCounter(stateId);
    for(var i = 1; i <= statelevel; i++)
    {
        value = value*0.99;
    }
    value = Math.floor(value);
    if(value<defender.mp){
        defender.gainMp(-value);
        value = 0;
        defender.startAnimation(200);
    }else{
        defender.gainMp(-defender.mp);
        value -= defender.mp;
    }
}

//</Custom React Effect>



 //<Custom User Row>
    row += 1;
//</Custom User Row>

//攻击范围（同一row）
//<Custom Target Eval>
var max_row = Yanfly.Param.RowMaximum;
for (var i = 0; i < foes.aliveMembers().length; ++i) {
    var member = foes.aliveMembers()[i];
    if (member.row() === (max_row+1)-user.row()) targets.push(member);
}
console.log(user.row());
if(targets.length>0){
    $gameSwitches.setValue(23,true);
    //$gameSwitches.setValue(29,false);
    if(user.isActor()){
        user.learnSkill(1);
    }
}else{
    $gameSwitches.setValue(23,false);
    //$gameSwitches.setValue(29,true);
    if(user.isActor()){
        user.forgetSkill(1);
    }
    user.setRow(user.row() + 1);
}
//</Custom Target Eval>




//<Custom React Effect>
if(value>0){
  //收到攻击会增加回合的状态
  var attacked_add_turn_state = [97];
  console.log(defender);
  if(defender._sumvalue>0){
      console.log(this);
      console.log(defender._stateTurns[stateId]);
        defender._sumvalue += value;
    }else{
      defender._sumvalue = value;
    }
    //defender.gainMp(-value);
    value =  0;
    if(attacked_add_turn_state.includes(stateId)){
      defender._stateTurns[stateId] += 1;
    }
    defender.setStateCounter(stateId, defender._sumvalue);
console.log(defender._sumvalue);
  }
//</Custom React Effect>

//<Custom Turn End Effect>
//console.log(this);
//console.log(user);
//console.log(user._sumvalue);
if(user._sumvalue>0){
  var current_value = Math.floor(user._sumvalue/(user._stateTurns[stateId]-1)-user.mdf);
  user._sumvalue -= (current_value+user.mdf);
  user.setStateCounter(stateId, user._sumvalue);
  user.startAnimation(106);
  console.log('时之护盾反噬伤害：'+current_value);
  console.log(user.action_ref);
    if(user.barrierPoints()>0){
        if(current_value>user.barrierPoints()){
            user.loseBarrier(user.barrierPoints());
            current_value -= user.barrierPoints();
        }else{
            user.loseBarrier(current_value);
            current_value = 0;
        }
    }
    if(current_value>0){
        user.gainHp(-current_value+user.barrierPoints());
        user.onDamage(current_value);
        user.startDamagePopup();
        if (user.isDead()) {
            user.performCollapse();
        }
    }
}
//</Custom Turn End Effect>

//<Custom Remove Effect>
this._sumvalue = 0;
//</Custom Remove Effect>



//伤口撕裂
//<Custom React Effect>
if(value>0){
  //收到攻击会增加回合的状态
  var attacked_add_turn_state = [97];
  console.log(defender);
  if(defender._bloodvalue>0){
        defender._bloodvalue += value;
    }else{
      defender._sumvalue = value;
    }
    //defender.gainMp(-value);
    value =  0;
    if(attacked_add_turn_state.includes(stateId)){
        //增加3-5回合
      defender._stateTurns[stateId] += Math.randomInt(3)+3;
    }
    defender.setStateCounter(stateId, defender._bloodvalue);
    console.log(defender._bloodvalue);
  }
//</Custom React Effect>


//<Custom Remove Effect>
this._bloodvalue = 0;
//</Custom Remove Effect>



<Custom React Effect>
if(value>0){
  if(defender._sumvalue>0){
      //console.log(this);
      //console.log(defender._stateTurns[stateId]);
        defender._sumvalue += value;
    }else{
      defender._sumvalue = value;
    }
    //defender.gainMp(-value);
    value =  0;
    defender.setStateCounter(stateId, defender._sumvalue);
console.log(defender._sumvalue);
  }
</Custom React Effect>

<Custom Turn End Effect>
if(user._sumvalue>0){
  var current_value = Math.floor(user._sumvalue/10-user.mdf);
  user._sumvalue -= (current_value+user.mdf);
  user.setStateCounter(stateId, user._sumvalue);
  user.startAnimation(106);
  console.log('时之护盾反噬伤害：'+current_value);
  console.log(user.action_ref);
    if(user.barrierPoints()>0){
        if(current_value>user.barrierPoints()){
            user.loseBarrier(user.barrierPoints());
            current_value -= user.barrierPoints();
        }else{
            user.loseBarrier(current_value);
            current_value = 0;
        }
    }
    if(current_value>0){
        user.gainHp(-current_value+user.barrierPoints());
        user.onDamage(current_value);
        user.startDamagePopup();
        if (user.isDead()) {
            user.performCollapse();
        }
    }
}
</Custom Turn End Effect>

<Custom Remove Effect>
this._sumvalue = 0;
</Custom Remove Effect>