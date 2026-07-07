"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const auth_module_1 = require("./auth/auth.module");
const admin_module_1 = require("./admin/admin.module");
const blogs_module_1 = require("./blogs/blogs.module");
const aws_module_1 = require("./aws/aws.module");
const statistics_module_1 = require("./statistics/statistics.module");
const management_module_1 = require("./management/management.module");
const documents_module_1 = require("./documents/documents.module");
const search_module_1 = require("./search/search.module");
const contact_module_1 = require("./contact/contact.module");
const members_module_1 = require("./members/members.module");
const local_call_module_1 = require("./local-call/local-call.module");
const decision_module_1 = require("./decision/decision.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            mongoose_1.MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/GAL_BACKEND'),
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            blogs_module_1.BlogsModule,
            aws_module_1.AwsModule,
            statistics_module_1.StatisticsModule,
            management_module_1.ManagementModule,
            documents_module_1.DocumentsModule,
            search_module_1.SearchModule,
            contact_module_1.ContactModule,
            members_module_1.MembersModule,
            local_call_module_1.LocalCallModule,
            decision_module_1.DecisionModule,
        ]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map