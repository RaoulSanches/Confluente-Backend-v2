import express, {Router, Request, Response} from "express";

import {Role} from "../models/database/role.model";

import {checkPermission} from "../permissions";
import {RoleWeb} from "../models/web/role.web.model";

const router: Router = express.Router();

router.route("/")
    /**
     * Gets all roles from the database
     */
    .get((req: Request, res: Response) => {
        // Check if the client is logged in
        const userId = res.locals.session ? res.locals.session.userId : null;

        // Check if the client has permission to manage roles
        checkPermission(userId, {
            type: "ROLE_VIEW",
            value: userId
        }).then((result: boolean) => {
            // If no result, then the client has no permission
            if (!result) {
                return res.sendStatus(403);
            }

            // If client has permission, find all roles in database
            Role.findAll({
                order: [
                    ["id", "ASC"]
                ]
            }).then(async (foundRoles: Role[]) => {
                // Transform dbRoles to webRoles
                const roles = await RoleWeb.getArrayOfWebModelsFromArrayOfDbModels(foundRoles);

                // Send the roles back to the client
                return res.send(roles);
            });
        });
    })

    /**
     * Creates a new role in the database
     */
    .post((req: Request, res: Response) => {
        // Check if the client is logged in
        const userId = res.locals.session ? res.locals.session.userId : null;

        // Check if the client has permission to manage roles
        checkPermission(userId, {
            type: "ROLE_MANAGE",
            value: userId
        }).then((result: boolean) => {
            // If no result, then the client has no permission
            if (!result) {
                return res.sendStatus(403);
            }

            // Check if required fields are filled in
            if (!req.body.name) {
                return res.sendStatus(400);
            }

            // Create new role in database
            return Role.create(req.body).then((createdRole: Role) => {
                return res.status(201).send(createdRole);
            }).catch((err: Error) => {
                return res.status(406).send("Role with identical name already exists");
            });
        });
    });

// Specific role route
router.route("/:id")
    /**
     * Get a specific role from the database and return to the client
     */
    .get((req: Request, res: Response) => {
        // Check if client has a session
        const userId = res.locals.session ? res.locals.session.userId : null;

        checkPermission(userId, {
            type: "ROLE_VIEW",
            value: userId
        }).then((result: boolean) => {
            // If no result, then the client has no permission
            if (!result) { return res.sendStatus(403); }

            // If client has permission, get the role from the database
            Role.findByPk(req.params.id).then(async (foundRole: Role) => {
                // Return if role not found
                if (foundRole === null) {
                    return res.status(404).send({status: "Not Found"});
                } else {
                    // Transform dbRole into webRole
                    const role = await RoleWeb.getWebModelFromDbModel(foundRole);

                    // Return the role
                    return res.send(role);
                }
            });
        });
    })

    /**
     * Edit a role
     */
    .put((req: Request, res: Response) => {
        // Check if client has a session
        const userId = res.locals.session ? res.locals.session.userId : null;

        // Check whether the client has permission to manage (edit) roles
        checkPermission(userId, {
            type: "ROLE_MANAGE",
            value: userId
        }).then((result: boolean) => {
            // If no permission, send 403
            if (!result) {
                return res.sendStatus(403);
            }

            // Find the role
            Role.findByPk(req.params.id).then((role: Role) => {
                // Return if role not found
                if (role === null) {
                    res.status(404).send({status: "Not Found"});
                } else {
                    return role.update(req.body).then((updatedRole: Role) => {
                        return res.status(200).send(updatedRole);
                    }, (err: Error) => {
                        console.log(err);
                    });
                }
            });
        });
    })

    /**
     * Delete role from the database
     */
    .delete((req: Request, res: Response) => {
        // Check if client has a session
        const userId = res.locals.session ? res.locals.session.userId : null;

        // Check if client has the permission to manage (delete) roles
        checkPermission(userId, {
            type: "ROLE_MANAGE",
            value: userId
        }).then((result: boolean) => {
            // If no permission, send 403
            if (!result) { return res.sendStatus(403); }

            // Find the role
            Role.findByPk(req.params.id).then((role: Role): any => {
                // Return if role not found
                if (role === null) {
                    return res.status(404).send({status: "Not Found"});
                } else {
                    // Destroy role in database
                    return role.destroy();
                }
            });
        }).then(() => {
            return res.status(204).send({status: "Successful"});
        });
    });

module.exports = router;
