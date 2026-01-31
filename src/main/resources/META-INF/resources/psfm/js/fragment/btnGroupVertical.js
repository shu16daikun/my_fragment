import { getLoger } from "/psfm/js/common/loger.js";

const LOG = getLoger("psfm.btn-group");

const PREFIX_V = "myBtnGroup_";
const PREFIX_H = "myBtnHGroup_";

function nearestUnboundLabel(container, inp) {
	const span = LOG.logStart("nearestUnboundLabel", { level: "TRACE" });

	let node = inp.nextElementSibling;
	while (node) {
		if (node.tagName === "LABEL" && !node.htmlFor) {
			LOG.logEnd(span);
			return node;
		}
		node = node.nextElementSibling;
	}

	const out = container.querySelector("label:not([for])");
	LOG.logEnd(span);
	return out;
}

export const wireBtnGroups = (root = document) => {
	const span = LOG.logStart("wireBtnGroups");

	const vGroups = root.querySelectorAll(".my-btn-group");
	const hGroups = root.querySelectorAll(".my-btn-group-horizontal");

	LOG.debug("wireBtnGroups: vGroups={0} hGroups={1}", vGroups.length, hGroups.length);

	vGroups.forEach((group, gi) => {
		const gid = group.id && group.id.trim().length ? group.id : `${PREFIX_V}${gi}`;
		if (!group.id) group.id = gid;

		const inputs = group.querySelectorAll('input[type="checkbox"]');
		inputs.forEach((inp, ii) => {
			if (!inp.id) inp.id = `${gid}_${ii}`;

			const lbl =
				(inp.nextElementSibling && inp.nextElementSibling.tagName === "LABEL")
					? inp.nextElementSibling
					: group.querySelector(`label[for="${inp.id}"]`) || nearestUnboundLabel(group, inp);

			if (lbl && !lbl.htmlFor) lbl.htmlFor = inp.id;
		});
	});

	hGroups.forEach((hgroup, gi) => {
		const gid = hgroup.id && hgroup.id.trim().length ? hgroup.id : `${PREFIX_H}${gi}`;
		if (!hgroup.id) hgroup.id = gid;

		const options = hgroup.querySelectorAll(".my-btn-option");
		options.forEach((opt, oi) => {
			const inp = opt.querySelector('input[type="checkbox"]');
			const lbl = opt.querySelector("label");
			if (!inp || !lbl) return;

			if (!inp.id) inp.id = `${gid}_${oi}`;
			if (!lbl.htmlFor) lbl.htmlFor = inp.id;
		});
	});

	LOG.logEnd(span);
};

export const setBtnGroupVertical = (root = document) => {
	const span = LOG.logStart("setBtnGroupVertical");
	wireBtnGroups(root);
	LOG.logEnd(span);
};
