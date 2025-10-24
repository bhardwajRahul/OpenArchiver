import { Request, Response } from 'express';
import { UserService } from '../../services/UserService';
import * as schema from '../../database/schema';
import { sql } from 'drizzle-orm';
import { db } from '../../database';

const userService = new UserService();

export const getUsers = async (req: Request, res: Response) => {
	const users = await userService.findAll();
	res.json(users);
};

export const getUser = async (req: Request, res: Response) => {
	const user = await userService.findById(req.params.id);
	if (!user) {
		return res.status(404).json({ message: req.t('user.notFound') });
	}
	res.json(user);
};

export const createUser = async (req: Request, res: Response) => {
	const { email, first_name, last_name, password, roleId } = req.body;
	if (!req.user || !req.user.sub) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	const actor = await userService.findById(req.user.sub);
	if (!actor) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	const newUser = await userService.createUser(
		{ email, first_name, last_name, password },
		roleId,
		actor,
		req.ip || 'unknown'
	);
	res.status(201).json(newUser);
};

export const updateUser = async (req: Request, res: Response) => {
	const { email, first_name, last_name, roleId } = req.body;
	if (!req.user || !req.user.sub) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	const actor = await userService.findById(req.user.sub);
	if (!actor) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	const updatedUser = await userService.updateUser(
		req.params.id,
		{ email, first_name, last_name },
		roleId,
		actor,
		req.ip || 'unknown'
	);
	if (!updatedUser) {
		return res.status(404).json({ message: req.t('user.notFound') });
	}
	res.json(updatedUser);
};

export const deleteUser = async (req: Request, res: Response) => {
	const userCountResult = await db.select({ count: sql<number>`count(*)` }).from(schema.users);

	const isOnlyUser = Number(userCountResult[0].count) === 1;
	if (isOnlyUser) {
		return res.status(400).json({
			message: req.t('user.cannotDeleteOnlyUser'),
		});
	}
	if (!req.user || !req.user.sub) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	const actor = await userService.findById(req.user.sub);
	if (!actor) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
	await userService.deleteUser(req.params.id, actor, req.ip || 'unknown');
	res.status(204).send();
};
