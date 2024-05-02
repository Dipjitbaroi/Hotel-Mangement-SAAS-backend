import { Dashboard, DashboardTable } from "./models/dashboard.model.js";
import User from "./models/user.model.js";

export const checkLicenseRenewal = async () => {
  try {
    const currentDate = new Date();
    const month_name = currentDate.toLocaleString("en-US", { month: "long" }); // Full month name
    const year = currentDate.getFullYear().toString();
    const expiredLicenses = await User.find({
      bill_to: { $lt: currentDate },
      status: { $in: ["Active", "Deactive", "Suspended"] },
      role: "owner", // To avoid unnecessary updates
    });

    if (expiredLicenses.length > 0) {
      for (const license of expiredLicenses) {
        const parent = await User.findById(license.parent_id);
        // Check if extended_time array exists and has items
        if (license.extended_time && license.extended_time.length > 0) {
          // Check if any extended_time.to field date is larger than the currentDate
          const hasValidExtendedTime = license.extended_time.some(
            (time) => time.to > currentDate
          );

          if (!hasValidExtendedTime) {
            if (parent.role === "admin") {
              const adminDashboard = await Dashboard.findOne({
                user_id: parent._id,
              });

              adminDashboard.total_expired_lic += 1;
              adminDashboard.total_suspended_lic -= 1;

              await adminDashboard.save();

              const adminDashboardTable = await DashboardTable.findOne({
                user_id: parent._id,
                month_name: month_name,
                year: year,
              });
              if (adminDashboardTable) {
                adminDashboardTable.total_expired += 1;
                await adminDashboardTable.save();
              } else {
                // Create a new dashboard table entry
                const newDashboardTable = new DashboardTable({
                  user_id: parent._id,
                  user_role: "admin",
                  total_expired: 1,
                });
                // Save the new dashboard table to the database
                await newDashboardTable.save();
              }
            }
            if (parent.role === "subadmin") {
              const adminDashboard = await Dashboard.findOne({
                user_id: parent.parent_id,
              });
              const subadminDashboard = await Dashboard.findOne({
                user_id: parent._id,
              });
              adminDashboard.total_expired_lic += 1;
              adminDashboard.total_suspended_lic -= 1;
              subadminDashboard.total_expired_lic += 1;
              subadminDashboard.total_suspended_lic -= 1;

              await adminDashboard.save();
              await subadminDashboard.save();

              const adminDashboardTable = await DashboardTable.findOne({
                user_id: parent.parent_id,
                month_name: month_name,
                year: year,
              });
              if (adminDashboardTable) {
                adminDashboardTable.total_expired += 1;
                await adminDashboardTable.save();
              } else {
                // Create a new dashboard table entry
                const newDashboardTable = new DashboardTable({
                  user_id: parent.parent_id,
                  user_role: "admin",
                  total_expired: 1,
                });
                // Save the new dashboard table to the database
                await newDashboardTable.save();
              }
              const subadminDashboardTable = await DashboardTable.findOne({
                user_id: parent._id,
                month_name: month_name,
                year: year,
              });
              if (subadminDashboardTable) {
                subadminDashboardTable.total_expired += 1;
                await subadminDashboardTable.save();
              } else {
                // Create a new dashboard table entry
                const newDashboardTable = new DashboardTable({
                  user_id: parent._id,
                  user_role: parent.role,
                  total_expired: 1,
                });
                // Save the new dashboard table to the database
                await newDashboardTable.save();
              }
            }
            // Update the corresponding owner in the User model and set status to "Expired"
            await User.findByIdAndUpdate(license._id, {
              status: "Expired",
            });
          }
        } else {
          if (parent.role === "admin") {
            const adminDashboard = await Dashboard.findOne({
              user_id: parent._id,
            });

            adminDashboard.total_expired_lic += 1;

            await adminDashboard.save();

            const adminDashboardTable = await DashboardTable.findOne({
              user_id: parent._id,
              month_name: month_name,
              year: year,
            });
            if (adminDashboardTable) {
              adminDashboardTable.total_expired += 1;
              await adminDashboardTable.save();
            } else {
              // Create a new dashboard table entry
              const newDashboardTable = new DashboardTable({
                user_id: parent._id,
                user_role: "admin",
                total_expired: 1,
              });
              // Save the new dashboard table to the database
              await newDashboardTable.save();
            }
          }
          if (parent.role === "subadmin") {
            const adminDashboard = await Dashboard.findOne({
              user_id: parent.parent_id,
            });
            const subadminDashboard = await Dashboard.findOne({
              user_id: parent._id,
            });
            adminDashboard.total_expired_lic += 1;
            subadminDashboard.total_expired_lic += 1;

            await adminDashboard.save();
            await subadminDashboard.save();

            const adminDashboardTable = await DashboardTable.findOne({
              user_id: parent.parent_id,
              month_name: month_name,
              year: year,
            });
            if (adminDashboardTable) {
              adminDashboardTable.total_expired += 1;
              await adminDashboardTable.save();
            } else {
              // Create a new dashboard table entry
              const newDashboardTable = new DashboardTable({
                user_id: parent.parent_id,
                user_role: "admin",
                total_expired: 1,
              });
              // Save the new dashboard table to the database
              await newDashboardTable.save();
            }
            const subadminDashboardTable = await DashboardTable.findOne({
              user_id: parent._id,
              month_name: month_name,
              year: year,
            });
            if (subadminDashboardTable) {
              subadminDashboardTable.total_expired += 1;
              await subadminDashboardTable.save();
            } else {
              // Create a new dashboard table entry
              const newDashboardTable = new DashboardTable({
                user_id: parent._id,
                user_role: parent.role,
                total_expired: 1,
              });
              // Save the new dashboard table to the database
              await newDashboardTable.save();
            }
          }
          await User.findByIdAndUpdate(license._id, { status: "Expired" });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Error checking license renewal" });
  }
};
