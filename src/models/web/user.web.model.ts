import {RoleWeb} from "./role.web.model";
import {UserGroupWeb} from "./usergroup.web.model";
import {SubscriptionWeb} from "./subscription.web.model";
import {AbstractWebModel} from "./abstract.web.model";
import {Model} from "sequelize-typescript";
import {copyMatchingSourceKeyValues} from "../../helpers/web.model.copy.helper";
import {Role} from "../database/role.model";
import {User} from "../database/user.model";
import {GroupWeb} from "./group.web.model";

export class UserWeb extends AbstractWebModel {

    /**
     * Database id of the user.
     */
    public id: number;

    /**
     * Email of the user.
     */
    public email!: string;

    /**
     * First name of the user.
     */
    public firstName: string;

    /**
     * Last name of the user.
     */
    public lastName: string;

    /**
     * Display name of the user.
     * Usually concatenation of first name and last name
     */
        // TODO delete this, and just make a function for get Display Name or smth
    public displayName: string;

    /**
     * Major of the user
     */
    public major: string | null;

    /**
     * Stores the address of the user.
     */
    public address: string | null;

    /**
     * Honors track of the user.
     */
    public track: string | null;

    /**
     * Year that the user started with honors.
     */
    public honorsGeneration: number | null;

    /**
     * Stores what kind of membership the user has
     */
    public honorsMembership: string;

    /**
     * Campus card number of the user.
     */
    public campusCardNumber: string | null;

    /**
     * Mobile phone number of the user.
     */
    public mobilePhoneNumber: string | null;

    /**
     * Whether the account of the user is approved
     */
    public approved: boolean;

    /**
     * The hash link via which the account can be approved
     */
    public approvingHash: string;

    /**
     * Whether this user can organize events
     */
    public canOrganize: boolean;

    /**
     * Stores the groups that this user is a part of, represented by UserGroupWeb objects.
     */
    public groups: UserGroupWeb[];

    /**
     * Stores the activities this user is subscribed to, represented by SubscriptionWeb objects.
     */
    public activities: SubscriptionWeb[];

    /**
     * Stores the role this user has, represented by a RoleWeb object.
     */
    public role: RoleWeb;

    public static async getWebModelFromDbModel(dbUser: Model): Promise<UserWeb> {
        if (!(dbUser instanceof User)) {
            throw new Error("user.web.model.getWebModelFromDbModel: dbUser was not a User instance");
        }

        // @ts-ignore
        const webUser = copyMatchingSourceKeyValues(new UserWeb(), dbUser.dataValues);

        webUser.groups = [];
        if ((dbUser as User).groups && (dbUser as User).groups.length !== 0) {
            for (const group of (dbUser as User).groups) {
                const func = group.UserGroup.func;
                delete group.UserGroup;
                GroupWeb.getWebModelFromDbModel(group).then(function(webGroup: GroupWeb): void {
                    webUser.groups.push(new UserGroupWeb(webUser, webGroup, func));
                });
            }
        }

        if ((dbUser as User).roleId !== undefined || (dbUser as User).roleId !== null) {
            const dbRole = await Role.findOne({where: {id: (dbUser as User).roleId}});

            webUser.role = await RoleWeb.getWebModelFromDbModel(dbRole);

            webUser.canOrganize = webUser.role.ACTIVITY_MANAGE || webUser.groups.some(
                function(groupOfUser: UserGroupWeb): boolean {
                    return groupOfUser.group.canOrganize;
                }
            );
        }


        return webUser;
    }

    public getCopyable(): string[] {
        return ["id", "email", "firstName", "lastName", "displayName", "major", "address", "track", "honorsGeneration", "honorsMembership", "campusCardNumber", "mobilePhoneNumber", "approved", "approvingHash", "canOrganize"];
    }
}
