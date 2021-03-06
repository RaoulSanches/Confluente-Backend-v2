import {UserWeb} from "./user.web.model";
import {AbstractWebModel} from "./abstract.web.model";
import {Model} from "sequelize-typescript";
import {copyMatchingSourceKeyValues} from "../../helpers/web.model.copy.helper";
import {UserGroupWeb} from "./usergroup.web.model";
import {Group} from "../database/group.model";

export class GroupWeb extends AbstractWebModel {

    /**
     * Database ID of the group
     * Can be empty if it is to be defined by the database yet.
     */
    public id: number;

    /**
     * Display name of the group (shorter than fullName but identifiable).
     */
    public displayName!: string;

    /**
     * Full name of the group.
     */
    public fullName!: string;

    /**
     * Description of the group.
     */
    public description!: string;

    /**
     * Whether the group can organize activities.
     */
    public canOrganize!: boolean;

    /**
     * The email address of the group.
     */
    public email!: string;

    /**
     * The type of the group.
     */
    public type!: string;

    /**
     * Stores the members that this group has as UserGroupWeb objects.
     */
    public members!: UserGroupWeb[];

    public static async getWebModelFromDbModel(dbGroup: Model): Promise<GroupWeb> {
        if (!(dbGroup instanceof Group)) {
            throw new Error("group.web.model.getWebModelFromDbModel: dbGroup was not a Group instance.");
        }

        // for each attribute where the type and name are equal, copy them over
        // @ts-ignore
        const webGroup: GroupWeb = copyMatchingSourceKeyValues(new GroupWeb(), dbGroup.dataValues);

        // copy over the group members
        webGroup.members = [];
        if ((dbGroup as Group).members && (dbGroup as Group).members.length !== 0) {
            for (const member of (dbGroup as Group).members) {
                const func = member.UserGroup.func;
                delete member.UserGroup;
                await UserWeb.getWebModelFromDbModel(member).then((user: UserWeb): void => {
                    webGroup.members.push(new UserGroupWeb(user, null, func));
                });
            }
        }

        return webGroup;
    }

    public getCopyable(): string[] {
        return ["id", "displayName", "fullName", "description", "canOrganize", "email", "type"];
    }
}
