import {enemy_templates, Enemy} from "./enemies.js";
var locations = {};
//will contain all the locations


function Location(location_data) {
    /* always safe,

    */
        this.name = location_data.name;
        this.description = location_data.description;
        this.connected_locations = location_data.connected_locations; //a list
        this.is_unlocked = location_data.is_unlocked;

        // Activities, maybe make a special object type for actions (passive_activities ?), like sleeping/training/learning 
        // => or make it only one action per "location_action", similarly to combat_zone (except no child zones)?,
        // or "location_actions" (a list/dict)
        // either way, leaving the location should automatically stop it

        // is_unlocked; //quests and combat_zones and stuff can have something like "unlocks: Location"
        //or maybe "rewards: {"locations": X, "stats": X, "items": X, "quests"}}" or something like that?"
        // something for conversations
}

function Combat_zone(location_data) {
    /* 
    after clearing, maybe permanently unlock a single, harder zone (meaning also more xp/loot), from where the only way is back;
    */
    this.name = location_data.name;
    this.description = location_data.description;
    this.is_unlocked = location_data.is_unlocked;
    this.enemies_list = location_data.enemies_list;
    this.enemy_count = location_data.enemy_count;
    this.enemies_killed = 0; 
    /*
    TODO: increase after each kill, upon reaching enemy_count (and it's multiples if repeatable_rewards) 
    give the rewards and possibly unlock some new zone
    */
    this.reset_kills_on_leaving = location_data.reset_kills_on_leaving;
    this.repeatable_rewards = location_data.repeatable_rewards; //if rewards can be obtained on subsequent clearings
    this.parent_location = location_data.parent_location;
    this.rewards = location_data.rewards;

    this.get_next_enemy = function() {
        var enemy = this.enemies_list[Math.floor(Math.random() * this.enemies_list.length)];
        return new Enemy({
            name: enemy.name, description: enemy.description, xp_value: enemy.xp_value, 
            stats: {health: Math.round(enemy.stats.health * (1.1 - Math.random() * 0.2)),
                    strength: Math.round(enemy.stats.strength * (1.1 - Math.random() * 0.2)), agility: Math.round(enemy.stats.agility * (1.1 - Math.random() * 0.2)),
                    magic: Math.round(enemy.stats.magic * (1.1 - Math.random() * 0.2)), attack_speed: Math.round(enemy.stats.attack_speed * (1.1 - Math.random() * 0.2)*100)/100,
                    defense: Math.round(enemy.stats.defense * (1.1 - Math.random() * 0.2))}, 
            loot_list: enemy.loot_list
            //up to 10% deviation for each stat
            //attack speed is the only one allowed to not be an integer
        });;
        //creates and returns a new enemy based on template
        //maybe add some location-related loot?
    }
}

locations["Village"] = new Location({ 
    connected_locations: [], 
    description: "Medium-sized village surrounded by many fields, some of them infested by rats. Other than that, there's nothing interesting around.", 
    is_unlocked: true,
    name: "Village", 
});

locations["Infested field"] = new Combat_zone({
    description: "Field infested with rats.", 
    enemy_count: 30, 
    enemies_list: [enemy_templates["Starving wolf rat"], enemy_templates["Wolf rat"]],
    is_unlocked: true, 
    name: "Infested field", 
    parent_location: locations["Village"],
    reset_kills_on_leaving: false, 
});
locations["Village"].connected_locations.push(locations["Infested field"]);
//remember to always add it like that, otherwise travel will be possible only in one direction and location might not even be reachable

locations["Forest road"] = new Location({
    name: "Forest road", description: "Shabby road leading through a dark forest, the only way to leave your village",
    connected_locations: [locations["Village"]],
    is_unlocked: false,
});
locations["Village"].connected_locations.push(locations["Forest road"]);

locations["Forest"] = new Combat_zone({
    name: "Forest", description: "Forest surrounding your village, a dangerous place", is_unlocked:  true,
    enemies_list: [enemy_templates["Starving wolf"], enemy_templates["Young wolf"]],
    enemy_count: 30, reset_kills_on_leaving: false, parent_location: locations["Forest road"],
    rewards: {locations: locations["Deep forest"]},
});
locations["Forest road"].connected_locations.push(locations["Forest"]);

locations["Deep forest"] = new Combat_zone({
    name: "Deep forest", description: "Deeper part of the forest, a dangerous place", is_unlocked: false,
    enemies_list: [enemy_templates["Wolf"], enemy_templates["Starving wolf"], enemy_templates["Young wolf"]],
    enemy_count: 50, reset_kills_on_leaving: false, parent_location: locations["Forest road"],
});
locations["Forest road"].connected_locations.push(locations["Deep forest"]);

export {locations};
