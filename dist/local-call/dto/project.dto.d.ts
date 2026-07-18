import { MultiLangTextDto } from 'src/blogs/dto/multiLangText.dto';
import { ApprovalStatusEnum } from 'src/enums/status.enum';
export declare class ProjectDto {
    title: MultiLangTextDto;
    description: MultiLangTextDto;
    pdfUrl: string;
    imageUrl?: string;
    status?: ApprovalStatusEnum;
}
