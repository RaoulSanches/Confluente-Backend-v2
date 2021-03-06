import q, {Promise} from "q";
import {pbkdf2, pbkdf2Sync, randomBytes} from "crypto";
import {User} from "../models/database/user.model";
import {Session} from "../models/database/session.model";

const digest_iterations = (process.env.NODE_ENV === "test") ? 1 : 100000;

/**
 * Asynchronous function returning Hash of password based on password and salt.
 * @param password             Password to be checked.
 * @param salt                 Salt to be used in check.
 * @return Hash, or rejects
 */
export function getPasswordHash(password: string, salt: string): any {
    if (password === null) {
        throw new Error("auth.helper.getPasswordHash: password was null.");
    }

    if (salt === null) {
        throw new Error("auth.helper.getPasswordHash: salt was null.");
    }

    return Promise((resolve: any, reject: any) => {
        pbkdf2(password, salt, digest_iterations, 256 / 8, 'sha256',
            (err: Error | null, hash: Buffer) => {
            if (err) {
                return reject(err);
            }
            return resolve(hash);
        });
    });
}


/**
 * Generates random string of characters i.e salt.
 * @param length                Length of the random string.
 * @return Salt characters
 */
export function generateSalt(length: number): string {
    if (length < 0) {
        throw new Error("auth.helper.generateSalt: length had negative value " + length.toString() + ".");
    }

    return randomBytes(Math.ceil(length / 2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0, length);   /** return required number of characters */
}

/**
 * Synchronous function returning Hash of password based on password and salt
 * @param password              Password for which Hash is to be found
 * @param salt                  Salt for which Hash is to be found
 * @return Hash
 */
export function getPasswordHashSync(password: string, salt: string): Buffer {
    if (password === null) {
        throw new Error("auth.helper.getPasswordHashSync: password was null.");
    }

    if (salt === null) {
        throw new Error("auth.helper.getPasswordHashSync: salt was null.");
    }


    return pbkdf2Sync(password, salt, digest_iterations, 256 / 8, 'sha256');
}


/**
 * Function for verifying user identity based on email and password.
 * @param email                 Email of user.
 * @param password              Password of user.
 * @return user object if valid, otherwise null
 */
export function authenticate(email: string, password: string): any {
    email = email.toLowerCase();
    return User.findOne({where: {email}}).then((user: User | null) => {
        if (user === null) {
            throw new Error("Email address " + email + " not associated to any account.");
        }

        return getPasswordHash(password, user.passwordSalt)
            .then((hash: Buffer) => {
                if (hash.equals(user.passwordHash)) {
                    return user;
                } else {
                    throw new Error("Username or password incorrect");
                }
            });
    });
}


/**
 * Function for generating session with logged in user on given IP, with a random token and set lifetime
 * @param userId                ID of the user.
 * @param ip                    IP address associated to user session.
 * @return session
 */
export function startSession(userId: number, ip: string): any {
    if (ip === null) {
        throw new Error("auth.helper.startSession: IP was null.");
    } else if (ip === "") {
        throw new Error("auth.helper.startSession: IP was empty.");
    }
    
    const session_lifetime = 7; // in days
    return q.nfbind(randomBytes)(32).then((bytes: any) => {
        return Session.create({
            userId: userId,
            ip,
            token: bytes,
            expires: (new Date()).setDate(new Date().getDate() + session_lifetime)
        });
    });
}
