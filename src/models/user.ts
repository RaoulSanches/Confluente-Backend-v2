import {
    AllowNull,
    AutoIncrement, BelongsToMany,
    Column,
    DataType,
    Default, ForeignKey, HasOne,
    Model,
    PrimaryKey,
    Table,
    Unique
} from "sequelize-typescript";

import {Group} from './group';
import {Activity} from "./activity";
import {Role} from "./role";

@Table({timestamps: false})
export class User extends Model {

    /**
     * Database id of the user.
     */
    @Column(DataType.INTEGER.UNSIGNED)
    @AutoIncrement
    @Unique
    @AllowNull(false)
    public id!: number;

    /**
     * Email of the user.
     */
    // TODO Check if we cant better have the db id as the primary key?
    @Column(DataType.STRING(128))
    @PrimaryKey
    @Unique
    @AllowNull(false)
    public email!: string;

    /**
     * First name of the user.
     */
    @Column(DataType.STRING(128))
    @AllowNull(false)
    public firstName!: string;

    /**
     * Last name of the user.
     */
    @Column(DataType.STRING(128))
    @AllowNull(false)
    public lastName!: string;

    /**
     * Display name of the user.
     * Usually concatenation of first name and last name
     */
        // TODO delete this, and just make a function for get Display Name or smth
    @Column(DataType.STRING(128))
    @AllowNull(false)
    public displayName!: string;

    /**
     * Major of the user
     */
    @Column(DataType.STRING(128))
    public major!: string | null;

    /**
     * Stores the address of the user.
     */
    @Column(DataType.STRING(128))
    public address!: string | null;

    /**
     * Honors track of the user.
     */
    @Column(DataType.STRING(128))
    public track!: string | null;

    /**
     * Year that the user started with honors.
     */
    @Column(DataType.INTEGER)
    public honorsGeneration!: number | null;
    
    /**
     * Stores what kind of membership the user has
     */
    @Column(DataType.STRING(128))
    @AllowNull(false)
    public honorsMembership!: string;

    /**
     * Campus card number of the user.
     */
    @Column(DataType.STRING(128))
    public campusCardNumber!: string | null;

    /**
     * Mobile phone number of the user.
     */
    @Column(DataType.STRING(128))
    public mobilePhoneNumber!: string | null;

    /**
     * Whether the user gave consent regarding portrait right.
     */
    @Column(DataType.BOOLEAN)
    @AllowNull(false)
    @Default(false)
    public consentWithPortraitRight!: boolean;

    /**
     * Hash of the password of the user.
     */
    @Column(DataType.BLOB)
    @AllowNull(false)
    public passwordHash!: any;

    /**
     * Salt of the password of the user.
     */
    @Column(DataType.BLOB)
    @AllowNull(false)
    public passwordSalt!: any;

    /**
     * Whether the account of the user is approved
     */
    @Column(DataType.BOOLEAN)
    @AllowNull(false)
    @Default(false)
    public approved!: boolean;

    /**
     * The hash link via which the account can be approved
     */
    @Column(DataType.STRING(128))
    @AllowNull(false)
    public approvingHash!: string;

    // TODO add nice comments
    @BelongsToMany(() => Group, () => UserGroup)
    public groups: Group[];

    @BelongsToMany(() => Activity, () => Subscription)
    public activities: Activity[];

    @HasOne(() => Role)
    public role: Role;
}

/**
 * userGroup is the function relating users to groups via userGroup.
 * Function is the function that the user has in the group.
 */
// TODO add comments to this :)
@Table({timestamps: false})
export class UserGroup extends Model {

    @Column(DataType.INTEGER.UNSIGNED)
    @ForeignKey(() => User)
    @AllowNull(false)
    userId: number;

    @Column(DataType.INTEGER.UNSIGNED)
    @ForeignKey(() => Group)
    @AllowNull(false)
    groupId: number;

    @Column(DataType.STRING(128))
    @AllowNull(false)
    @Default("member")
    func: string;
}

/**
 * subscription is the function relating users to activities via subscriptions.
 * Answers are the answers that the user gave to the questions of the form.
 */
// TODO add comments to this :)
@Table({timestamps: false})
export  class Subscription extends Model {

    @Column(DataType.INTEGER.UNSIGNED)
    @ForeignKey(() => User)
    userId: number;

    @Column(DataType.INTEGER.UNSIGNED)
    @ForeignKey(() => Activity)
    activityId: number;

    @Column(DataType.STRING(8192))
    answers: string;
}
